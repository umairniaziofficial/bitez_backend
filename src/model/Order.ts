import mongoose from "mongoose";

interface OrderProduct {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

interface IOrder {
  _id: mongoose.Types.ObjectId;
  products: OrderProduct[];
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  orderDate: Date;
  total: number;
  status: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
}

const OrderSchema = new mongoose.Schema<IOrder>({
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  customerEmail: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  orderDate: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Cash On Delivery', 'PayPal', 'Bank Transfer'],
    default: 'Cash On Delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  }
}, { timestamps: true });

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;