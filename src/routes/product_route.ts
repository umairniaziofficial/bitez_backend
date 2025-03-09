import express, { Request, Response } from 'express';
import Product from '../model/Product';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
  '/products',
  async (_req: Request, res: Response): Promise<Response> => {
    try {
      const products = await Product.find();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res
        .status(500)
        .json({ message: 'Failed to fetch products', error });
    }
  }
);

router.get(
  '/products/:id',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res
        .status(500)
        .json({ message: 'Failed to fetch product', error });
    }
  }
);

router.post(
  '/products',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, price, category, ImgUrl, rating } = req.body;

      if (!name || !description || !price || !category || !ImgUrl) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const newProduct = new Product({
        name,
        description,
        price,
        category,
        ImgUrl,
        rating: rating || 4.5,
      });

      const savedProduct = await newProduct.save();
      return res.status(201).json(savedProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      return res
        .status(500)
        .json({ message: 'Failed to create product', error });
    }
  }
);

router.put(
  '/products/:id',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, description, price, category, ImgUrl, rating } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { name, description, price, category, ImgUrl, rating },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      return res
        .status(500)
        .json({ message: 'Failed to update product', error });
    }
  }
);

router.delete(
  '/products/:id',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      const deletedProduct = await Product.findByIdAndDelete(id);

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res
        .status(500)
        .json({ message: 'Failed to delete product', error });
    }
  }
);

router.get(
  '/products/category/:category',
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const { category } = req.params;
      const products = await Product.find({ category });
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return res
        .status(500)
        .json({ message: 'Failed to fetch products', error });
    }
  }
);

export default router;
