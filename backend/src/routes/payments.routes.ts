import { Router } from 'express';
import { PaymentController } from '../controllers/payments.controller';

const router = Router();

// Public routes (no authentication required for payments)
router.post('/stk-push', PaymentController.initiateSTKPush);
router.post('/pesapal', PaymentController.initiatePesapal);
router.post('/webhook', PaymentController.handleWebhook);
router.get('/status/:transactionId', PaymentController.getPaymentStatus);
router.get('/health', PaymentController.healthCheck);

export default router;

