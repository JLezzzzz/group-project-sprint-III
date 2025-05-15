import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";


const DiyItemSchema = new Schema({
    DiyId: { type: Schema.Types.ObjectId, ref: 'Diy', required: true },
    productType: { type: String, required: true },
    styleName: { type: String, required: true },
    title: { type: String, required:true, default: function () {return `${this.styleName} - ${this.productType}`;} },
    description: { type: String },
    price: { type: Number, default: 499, required:true },
    size: { type: [String], required: true },
    color: { type: [ColorSchema], required: true },
    tag: { type: [String] , default:[]},
    createdOn: { type: Date, default: new Date().getTime() },
  }, { _id: true });


const DiySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [DiyItemSchema], required: true },
    status: {
      type: String,
      enum: ['pending', 'publish'],
      default: 'pending'
    },
    stock: { type: Number, required: true, default: 100 },
    isCampaign: { type: Boolean , default: false },
    DiyDate: { type: Date, default: Date.now }
  });

export const Diy = model("Diy", DiySchema)
export const DiyItem = model("DiyItem", DiyItemSchema)