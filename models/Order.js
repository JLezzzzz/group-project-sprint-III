import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { CartItem } from "./Cart.js";
import { Product } from "./Product.js";

const OrderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: {
      type: Number,
      default: function () {
        return this.quantity * this.unitPrice;
      },
    },
    selectedSize: { type: String, required: true },
    selectedColor: { type: String, required: true },
    selectedImage: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

OrderItemSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [{
    cartId: {type: Schema.Types.ObjectId, ref:CartItem},
    productId: {type: Schema.Types.ObjectId, ref:Product},
    selectedSize: {type: String, required: true},
    selectedColor: {type: String, required: true},
    selectedImage: {type: String, required: true},
    quantity: {type: Number, required: true},
    unitPrice: {type: Number, required: true},
    totalPrice: {type: Number, required:true},
    addedAt: {type:Date},
  }],
  required: true, default: [] },
  shippingMethod: { type: String, default: "standard"},
  status: {type: String, enum: ["Pending", "To be delivered", "On delivering", "Cancelled", "Shipped"], default: "pending",},
  total: { type: Number, default: 0 },
  vat: { type: Number, default: 7 },
  address: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    address: { type: String, required: true },
    specific: { type: String },
    district: { type: String, required: true },
    subDistrict: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
  },
  payment: {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    cardNumber: {type: String, required: true},
    exp:{type: String, required: true},
    cvv: {type: String, required: true},
  },
  orderDate: { type: Date, default: Date.now },
});

export const Order = model("Order", OrderSchema);
export const OrderItem = model("OrderItem", OrderItemSchema);

// Hash cardNumber and cvv before saving
OrderSchema.pre("save", async function (next) {
  if (this.isModified("payment.cardNumber")) {
    this.payment.cardNumber = await bcrypt.hash(this.payment.cardNumber, 10);
  }

  if (this.isModified("payment.cvv")) {
    this.payment.cvv = await bcrypt.hash(this.payment.cvv, 10);
  }

  next();
});