import { payheroClient, PaymentStatus } from '../config/payhero';
import { PaymentInitiationRequest, PayHeroPaymentResponse, PayHeroWebhookPayload } from '../types/contribution';
import { supabase } from '../config/supabase';
import { JarService } from './jar.service';

export class PaymentService {
  /**
   * Initiate STK Push payment with PayHero
   */
  static async initiateSTKPayment(paymentData: PaymentInitiationRequest & { phone_number: string }): Promise<PayHeroPaymentResponse> {
    try {
      // First verify that the jar exists
      const jar = await JarService.getJarById(paymentData.jar_id);
      if (!jar) {
        return {
          success: false,
          message: 'Jar not found'
        };
      }

      // Prepare STK Push payment request
      const stkPushDetails = {
        amount: paymentData.amount,
        phone_number: paymentData.phone_number,
        channel_id: 333, // You may need to adjust this based on your PayHero setup
        provider: 'm-pesa',
        external_reference: `jar_${paymentData.jar_id}_${Date.now()}`,
        callback_url: `${process.env['API_BASE_URL']}/api/payments/webhook`
      };

      // Make STK Push request using PayHero wrapper
      const response = await payheroClient.makeStkPush(stkPushDetails);

      if (response && response.success) {
        return {
          success: true,
          transaction_id: response.transaction_id || response.external_reference,
          message: 'STK Push payment initiated successfully'
        };
      } else {
        return {
          success: false,
          message: response?.message || 'Failed to initiate STK Push payment'
        };
      }
    } catch (error: any) {
      console.error('PayHero STK Push initiation error:', error);
      
      // Handle specific PayHero errors
      if (error.response?.data) {
        const errorData = error.response.data;
        console.error('PayHero error details:', {
          error_code: errorData.error_code,
          error_message: errorData.error_message,
          status_code: errorData.status_code
        });

        // Provide user-friendly error messages based on PayHero error codes
        if (errorData.error_code === 'PERMISSION_DENIED' && errorData.error_message?.includes('inactive payment channel')) {
          return {
            success: false,
            message: 'Payment service is temporarily unavailable. Please contact support or try Pesapal payment instead.',
            error_details: {
              code: errorData.error_code,
              message: 'Payment channel is inactive - requires PayHero account activation'
            }
          };
        }
        
        if (errorData.error_code === 'INVALID_PHONE_NUMBER') {
          return {
            success: false,
            message: 'Invalid phone number format. Please use the format: 07XXXXXXXX',
            error_details: {
              code: errorData.error_code,
              message: errorData.error_message
            }
          };
        }

        // Generic PayHero error handling
        return {
          success: false,
          message: `Payment failed: ${errorData.error_message || 'Unknown error'}`,
          error_details: {
            code: errorData.error_code,
            message: errorData.error_message
          }
        };
      }
      
      return {
        success: false,
        message: 'Payment service is temporarily unavailable. Please try again later or use Pesapal payment.',
        error_details: {
          message: error.message || 'Unknown error occurred'
        }
      };
    }
  }

  /**
   * Initiate Pesapal payment with PayHero
   */
  static async initiatePesapalPayment(paymentData: PaymentInitiationRequest & { 
    customer_email: string, 
    customer_first_name: string, 
    customer_last_name: string,
    phone_number?: string 
  }): Promise<PayHeroPaymentResponse> {
    try {
      // First verify that the jar exists
      const jar = await JarService.getJarById(paymentData.jar_id);
      if (!jar) {
        return {
          success: false,
          message: 'Jar not found'
        };
      }

      // Prepare Pesapal payment request
      const pesapalPaymentDetails = {
        currency: 'KES',
        amount: paymentData.amount,
        description: `Contribution to ${jar.title}`,
        customerEmail: paymentData.customer_email,
        customerFirstName: paymentData.customer_first_name,
        customerLastName: paymentData.customer_last_name,
        phoneNumber: paymentData.phone_number || '0712345678',
        countryCode: 'KE'
      };

      // Make Pesapal payment request using PayHero wrapper
      const response = await payheroClient.initiatePesapalPayment(pesapalPaymentDetails);

      if (response && response.orderTrackingId) {
        // Store the payment reference for webhook processing
        await this.createPaymentRecord({
          jar_id: paymentData.jar_id,
          transaction_id: response.orderTrackingId,
          amount: paymentData.amount,
          contributor_name: paymentData.contributor_name,
          status: 'pending'
        });

        return {
          success: true,
          payment_url: response.redirectUrl,
          transaction_id: response.orderTrackingId,
          message: 'Pesapal payment initiated successfully'
        };
      } else {
        return {
          success: false,
          message: 'Failed to initiate Pesapal payment'
        };
      }
    } catch (error) {
      console.error('PayHero Pesapal initiation error:', error);
      return {
        success: false,
        message: 'Failed to initiate Pesapal payment. Please try again.'
      };
    }
  }

  /**
   * Verify PayHero webhook signature
   */
  static async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the signature using PayHero's webhook secret
      // For now, we'll implement a basic verification
      const webhookSecret = process.env['PAYHERO_WEBHOOK_SECRET'];
      
      if (!webhookSecret) {
        console.warn('PayHero webhook secret not configured');
        return true; // Allow in development
      }

      // Simple signature verification (implement proper HMAC verification in production)
      const expectedSignature = `sha256=${Buffer.from(JSON.stringify(payload) + webhookSecret).toString('base64')}`;
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Process PayHero webhook
   */
  static async processWebhook(webhookData: PayHeroWebhookPayload): Promise<boolean> {
    try {
      // Verify the webhook signature
      const isValidSignature = await this.verifyWebhookSignature(webhookData, webhookData.signature);
      
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return false;
      }

      // Extract jar_id from the reference
      const reference = webhookData.reference;
      const jarIdMatch = reference.match(/jar_([^_]+)_/);
      
      if (!jarIdMatch || !jarIdMatch[1]) {
        console.error('Invalid reference format in webhook');
        return false;
      }

      const jarId = jarIdMatch[1];

      // Check if payment was successful
      if (webhookData.status === 'success') {
        // Get the jar to find contributor name from metadata
        const jar = await JarService.getJarById(jarId);
        if (!jar) {
          console.error('Jar not found for webhook processing');
          return false;
        }

        // Add contribution to the jar
        await JarService.addContribution(jarId, {
          contributor_name: 'Anonymous Contributor', // In production, you might store this in a separate table
          amount: webhookData.amount,
          currency: 'KES',
          is_anonymous: true
        });

        console.log(`Successfully processed payment for jar ${jarId}: ${webhookData.amount} KES`);
        return true;
      } else {
        console.log(`Payment failed for jar ${jarId}: ${webhookData.status}`);
        return true; // Still return true to acknowledge the webhook
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return false;
    }
  }

  /**
   * Get payment status from PayHero (for Pesapal transactions)
   */
  static async getPaymentStatus(transactionId: string): Promise<{
    status: PaymentStatus;
    amount?: number;
    message?: string;
  }> {
    try {
      const response = await payheroClient.verifyPesapalTransaction(transactionId);
      
      return {
        status: response.status || 'pending',
        amount: response.amount,
        message: response.message || 'Transaction verified'
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      return {
        status: 'failed',
        message: 'Failed to verify payment status'
      };
    }
  }

  /**
   * Get STK Push transaction status
   */
  static async getSTKPaymentStatus(transactionId: string): Promise<{
    status: PaymentStatus;
    amount?: number;
    message?: string;
  }> {
    try {
      const response = await payheroClient.transactionStatus(transactionId);
      
      return {
        status: response.status || 'pending',
        amount: response.amount,
        message: response.message || 'Transaction status retrieved'
      };
    } catch (error) {
      console.error('Get STK payment status error:', error);
      return {
        status: 'failed',
        message: 'Failed to verify STK Push payment status'
      };
    }
  }

  /**
   * Create a payment record in the database (for tracking)
   */
  static async createPaymentRecord(data: {
    jar_id: string;
    transaction_id: string;
    amount: number;
    contributor_name: string;
    status: PaymentStatus;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          jar_id: data.jar_id,
          transaction_id: data.transaction_id,
          amount: data.amount,
          contributor_name: data.contributor_name,
          status: data.status,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to create payment record:', error);
      }
    } catch (error) {
      console.error('Create payment record error:', error);
    }
  }
}

