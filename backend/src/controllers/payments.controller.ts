import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { PayHeroWebhookPayload } from '../types/contribution';
import { success, error, serverError, badRequest } from '../utils/response';

export class PaymentController {
  /**
   * Initiate STK Push payment
   */
  static async initiateSTKPush(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;

      // Validate required fields for STK Push
      if (!paymentData.jar_id || !paymentData.amount || !paymentData.contributor_name || !paymentData.phone_number) {
        badRequest(res, 'jar_id, amount, contributor_name, and phone_number are required for STK Push');
        return;
      }

      if (paymentData.amount <= 0) {
        badRequest(res, 'Amount must be greater than 0');
        return;
      }

      const result = await PaymentService.initiateSTKPayment(paymentData);
      
      if (result.success) {
        success(res, {
          payment_url: result.payment_url,
          transaction_id: result.transaction_id
        }, result.message);
      } else {
        // Include error details for better debugging and user feedback
        const errorResponse = {
          message: result.message || 'Failed to initiate STK Push payment',
          error_details: result.error_details
        };
        
        console.error('STK Push failed:', errorResponse);
        error(res, result.message || 'Failed to initiate STK Push payment', 400);
      }
    } catch (err) {
      console.error('Initiate STK Push error:', err);
      serverError(res, 'Failed to initiate STK Push payment');
    }
  }

  /**
   * Initiate Pesapal payment
   */
  static async initiatePesapal(req: Request, res: Response): Promise<void> {
    try {
      const paymentData = req.body;

      // Validate required fields for Pesapal
      if (!paymentData.jar_id || !paymentData.amount || !paymentData.contributor_name || 
          !paymentData.customer_email || !paymentData.customer_first_name || !paymentData.customer_last_name) {
        badRequest(res, 'jar_id, amount, contributor_name, customer_email, customer_first_name, and customer_last_name are required for Pesapal payment');
        return;
      }

      if (paymentData.amount <= 0) {
        badRequest(res, 'Amount must be greater than 0');
        return;
      }

      const result = await PaymentService.initiatePesapalPayment(paymentData);
      
      if (result.success) {
        success(res, {
          payment_url: result.payment_url,
          transaction_id: result.transaction_id
        }, result.message);
      } else {
        error(res, result.message || 'Failed to initiate Pesapal payment', 400);
      }
    } catch (err) {
      console.error('Initiate Pesapal error:', err);
      serverError(res, 'Failed to initiate Pesapal payment');
    }
  }

  /**
   * Handle PayHero webhook
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookData: PayHeroWebhookPayload = req.body;
      const signature = req.headers['x-payhero-signature'] as string;

      if (!signature) {
        error(res, 'Missing webhook signature', 400);
        return;
      }

      // Add signature to webhook data
      webhookData.signature = signature;

      const processed = await PaymentService.processWebhook(webhookData);
      
      if (processed) {
        success(res, { processed: true }, 'Webhook processed successfully');
      } else {
        error(res, 'Failed to process webhook', 500);
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
      serverError(res, 'Failed to process webhook');
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;

      if (!transactionId) {
        badRequest(res, 'Transaction ID is required');
        return;
      }

      const status = await PaymentService.getPaymentStatus(transactionId);
      success(res, status, 'Payment status retrieved successfully');
    } catch (err) {
      console.error('Get payment status error:', err);
      serverError(res, 'Failed to get payment status');
    }
  }

  /**
   * Health check for payment service
   */
  static async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      // Simple health check - in production you might want to ping PayHero API
      success(res, { 
        service: 'payment',
        status: 'healthy',
        timestamp: new Date().toISOString()
      }, 'Payment service is healthy');
    } catch (err) {
      console.error('Payment health check error:', err);
      serverError(res, 'Payment service health check failed');
    }
  }
}

