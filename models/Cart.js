import { Schema, model } from "mongoose";
const CartItemSchema = new Schema(
  {
    cartId: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
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
CartItemSchema.pre("save", function (next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

const CartSchema = new Schema(
  {
    sessionId: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, //, required: true
    items: { type: [CartItemSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "abandoned", "converted"],
      default: "active",
    },
    total: { type: Number, default: 0 },
    vat: { type: Number, default: 7 },
  },
  { timestamps: true }
);
export const Cart = model("Cart", CartSchema);
export const CartItem = model("CartItem", CartItemSchema);
