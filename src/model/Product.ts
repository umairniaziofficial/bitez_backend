import mongoose from 'mongoose';

interface IProduct {
  _id: mongoose.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  ImgUrl: string;
  rating: number;
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    ImgUrl: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;
