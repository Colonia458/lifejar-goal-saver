export interface Contribution {
  id: string;
  jar_id: string;
  contributor_name?: string;
  contributor_email?: string;
  amount: number;
  currency: string;
  payment_intent_id?: string;
  payment_status: string;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContributionRequest {
  jar_id: string;
  contributor_name?: string;
  contributor_email?: string;
  amount: number;
  currency?: string;
  message?: string;
  is_anonymous?: boolean;
}

export interface PaymentInitiationRequest {
  jar_id: string;
  amount: number;
  contributor_name: string;
}

export interface PayHeroPaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  message?: string;
}

export interface PayHeroWebhookPayload {
  transaction_id: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  currency: string;
  reference: string;
  signature: string;
}

