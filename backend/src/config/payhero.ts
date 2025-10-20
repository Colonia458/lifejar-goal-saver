// Import PayHero wrapper correctly
const PayHeroWrapper = require('payhero-wrapper');
const PayHero = PayHeroWrapper.default;

const payheroAuthToken = process.env['PAYHERO_AUTH_TOKEN'];
const pesapalConsumerKey = process.env['PESAPAL_CONSUMER_KEY'];
const pesapalConsumerSecret = process.env['PESAPAL_CONSUMER_SECRET'];
const pesapalApiUrl = process.env['PESAPAL_API_URL'] || 'https://payments.pesapal.com/pesapalv3/api';
const pesapalCallbackUrl = process.env['PESAPAL_CALLBACK_URL'] || `${process.env['API_BASE_URL']}/api/payments/webhook`;
const pesapalIpnId = process.env['PESAPAL_IPN_ID'];

// Basic validation
if (!payheroAuthToken) {
  console.warn('PayHero configuration incomplete. Please check your environment variables.');
  console.warn('Required: PAYHERO_AUTH_TOKEN');
}

// PayHero configuration
const PayHeroConfig = {
  Authorization: payheroAuthToken || '',
  pesapalConsumerKey: pesapalConsumerKey || '',
  pesapalConsumerSecret: pesapalConsumerSecret || '',
  pesapalApiUrl,
  pesapalCallbackUrl,
  pesapalIpnId: pesapalIpnId || ''
};

// Create PayHero client instance
export const payheroClient = new PayHero(PayHeroConfig);

// PayHero wrapper methods are now available directly on the client
// No need for endpoint constants since the wrapper handles them

// PayHero payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

