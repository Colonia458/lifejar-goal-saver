import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { success, error } from './utils/response';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import jarsRoutes from './routes/jars.routes';
import paymentsRoutes from './routes/payments.routes';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  success(res, {
    service: 'lifejar-backend',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0'
  }, 'Service is healthy');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jars', jarsRoutes);
app.use('/api/payments', paymentsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  success(res, {
    service: 'LifeJar Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      jars: '/api/jars',
      payments: '/api/payments'
    }
  }, 'Welcome to LifeJar Backend API');
});

// 404 handler
app.use('*', (req, res) => {
  error(res, `Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Don't leak error details in production
  const message = process.env['NODE_ENV'] === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';
    
  error(res, message, 500, 'INTERNAL_SERVER_ERROR');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LifeJar Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/`);
});

export default app;

