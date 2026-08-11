import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import apiRouter from './routes';
import { globalErrorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API welcome endpoint
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fundsroom Infotech Mini ERP + CRM REST API Service is Active',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      customers: '/api/v1/customers',
      products: '/api/v1/products',
      stock: '/api/v1/stock',
      challans: '/api/v1/challans',
      dashboard: '/api/v1/dashboard',
    },
  });
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fundsroom Infotech ERP API service running smoothly.',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// Centralized Error Handling
app.use(globalErrorHandler);

// Start HTTP Server
const PORT = parseInt(ENV.PORT, 10);
app.listen(PORT, () => {
  console.log(`🚀 Fundsroom Infotech ERP Server active on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
});

export default app;
