import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const AddressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order'},
    address: { type: String, required: true },
    specific: { type: String },
    district: { type: String, required: true },
    subDistrict: { type: String, required: true },
    city: { type: String, required: true },
    postal: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CreatorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  creatorName: {type: String, required: true},
  creatorBio: {type: String, required: true},
  ig: {type: String, default:function () {return this.creatorName;} },
  fb: {type: String, default:function () {return this.creatorName;}},
  x: {type: String, default:function () {return this.creatorName;}}
})

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  addresses: { type: [AddressSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  isCreator: { type: Boolean, default: false },
  creatorInfo: CreatorSchema
});




// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const Address = model("Address", AddressSchema);
export const User = model("User", UserSchema);
export const Creator = model("Creator", CreatorSchema);
