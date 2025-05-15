import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

// const ColorSchema = new Schema({
//     productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
//     colorName: { type: String, required: true },
//     colorCode: { type: String, required: true },
//     image: { type: [String], required: true },
//   }, { _id: false });

const ProductSchema = new Schema({
  styleName: { type: String, required: true },
  productType: { type: String, required: true },
  title: {
    type: String,
    required: true,
    default: function () {
      return this.styleName + " - " + this.productType;
    },
  },
  description: { type: String },
  price: { type: Number, default: 499, required: true },
  sizes: { type: [String], required: true },
  colors: { type: [String], required: true },
  tag: { type: [String], default: [] },
  images: { type: [String], default: [] },
  createdOn: { type: Date, default: new Date().getTime() },
});

// export const Product = model("Product", ProductSchema);
// export const Color = model("Color", ColorSchema);

export const Product = model("Product1", ProductSchema);
// export const Color = model("Color", ColorSchema)
