import { config } from './config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import connectToDatabase from './lib/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/product_route';
import orderRoutes from './routes/order_route';

const PORT = config.server.port;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);

app.post('/api/checkout', async (req: Request, res: Response) => {
  try {
    console.log('Checkout request received:', req.body);
    res.status(200).json({
      success: true,
      message: 'Checkout processed successfully',
      orderId: Date.now().toString(),
    });
  } catch (error) {
    console.error('Error in checkout endpoint:', error);
    res
      .status(500)
      .json({ message: 'Checkout processing failed', error: String(error) });
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', message: 'API is running' });
});

async function startServer() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down');
  process.exit(0);
});

startServer();
