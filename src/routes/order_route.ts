import express, { Request, Response } from 'express';
import Order from '../model/Order';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
  '/orders',
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const orders = await Order.find().sort({ orderDate: -1 });
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ message: 'Failed to fetch orders', error });
    }
  }
);

router.get(
  '/orders/:id',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      return res.status(500).json({ message: 'Failed to fetch order', error });
    }
  }
);

router.post(
  '/orders',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { products, customerEmail, total, status } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        return res
          .status(400)
          .json({ message: 'Order must contain at least one product' });
      }

      if (!customerEmail || !total) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const newOrder = new Order({
        products,
        customerEmail,
        total,
        status: status || 'Pending',
        orderDate: new Date(),
      });

      const savedOrder = await newOrder.save();
      return res.status(201).json(savedOrder);
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ message: 'Failed to create order', error });
    }
  }
);

router.put(
  '/orders/:id',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({ message: 'Failed to update order', error });
    }
  }
);

router.delete(
  '/orders/:id',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid order ID' });
      }

      const deletedOrder = await Order.findByIdAndDelete(id);

      if (!deletedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }

      return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      return res.status(500).json({ message: 'Failed to delete order', error });
    }
  }
);

router.get(
  '/orders/status/:status',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { status } = req.params;
      const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message:
            'Invalid status. Status must be one of: Pending, Processing, Delivered, Cancelled',
        });
      }

      const orders = await Order.find({ status }).sort({ orderDate: -1 });
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return res.status(500).json({ message: 'Failed to fetch orders', error });
    }
  }
);

router.get(
  '/orders/customer/:email',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.params;
      const orders = await Order.find({ customerEmail: email }).sort({
        orderDate: -1,
      });
      return res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders by customer:', error);
      return res.status(500).json({ message: 'Failed to fetch orders', error });
    }
  }
);

router.post(
  '/checkout',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      console.log('Processing checkout request:', req.body);

      const {
        products,
        customerEmail,
        customerName,
        customerPhone,
        total,
        shippingAddress,
        paymentMethod,
      } = req.body;

      if (!products || !Array.isArray(products) || products.length === 0) {
        console.log('Checkout validation error: Invalid products array');
        return res
          .status(400)
          .json({ message: 'Order must contain at least one product' });
      }

      for (const product of products) {
        if (
          !product.productId ||
          !product.name ||
          typeof product.price !== 'number' ||
          typeof product.quantity !== 'number'
        ) {
          console.log(
            'Checkout validation error: Invalid product data',
            product
          );
          return res
            .status(400)
            .json({ message: 'Invalid product data in order' });
        }
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!customerEmail || !emailRegex.test(customerEmail)) {
        console.log('Checkout validation error: Invalid email', customerEmail);
        return res.status(400).json({ message: 'Valid email is required' });
      }

      if (typeof total !== 'number' || total <= 0) {
        console.log('Checkout validation error: Invalid total', total);
        return res
          .status(400)
          .json({ message: 'Valid order total is required' });
      }

      const newOrder = new Order({
        products: products.map((p) => ({
          productId: p.productId,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        })),
        customerEmail,
        customerName,
        customerPhone,
        total,
        status: 'Pending',
        orderDate: new Date(),
        shippingAddress,
        paymentMethod: paymentMethod || 'Cash On Delivery',
        paymentStatus: 'Pending',
      });

      console.log('Saving new order:', newOrder);
      const savedOrder = await newOrder.save();
      console.log('Order saved successfully:', savedOrder._id);
      return res.status(201).json(savedOrder);
    } catch (error) {
      console.error('Error processing checkout:', error);

      return res.status(500).json({
        message: 'Failed to process checkout',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
