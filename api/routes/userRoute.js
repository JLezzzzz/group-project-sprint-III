// import { User, Address, Creator } from "../../models/User.js";
import express from "express";
import { User} from "../../models/User.js";
import { Order } from "../../models/Order.js";
import { verify } from "../../middlewares/verify.js";
import {authCookie} from "../../middlewares/authCookie.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Cart } from "../../models/Cart.js";

const router = express.Router();

//SignUp
router.post("/signUp", async (req, res) => {
  const { firstName, email, password, phoneNumber, userName, lastName, addresses = [] } = req.body;
  if (!firstName || !lastName || !email ||  !password ||  !phoneNumber ||  !userName) {
    return res.status(400).json({ error: true, message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: true, message: "Email already in use" });
    }

    const user = await User.create({
      firstName,
      email,
      password,
      phoneNumber,
      userName,
      lastName,
      addresses,
    });

    const cart = new Cart({userId: user._id})
    await cart.save()
    console.log(cart)

    res
      .status(201)
      .json({ error: false, message: "User registered successfully", user, cart });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

//Signin
router.post("/signIn", async (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ err: true, message: "Email and password are required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ err: true, message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ err: true, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: existingUser._id,
        email: existingUser.email,
        userName: existingUser.userName,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// Add New Address
router.post("/address/:userId/:orderId", verify, async (req, res) => {
  const {firstName,lastName,address, specific, subDistrict, district, city, postal, email, phone, smsPromotion = false,emailPromotion = false } = req;
    req.body;
  const {userId, orderId} = req.params

  if (!firstName || !lastName || !address || !specific || !subDistrict || !district || !city || !postal || !email || !phone || !smsPromotion || !emailPromotion) {
    return res
      .status(400)
      .json({ error: true, message: "Missing address fields" });
  }

  try {
    const user = await User.findById({ userId: userId });
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const order = await Order.findById({ orderId: orderId });
    if (!order) {
      return res.status(404).json({ error: true, message: "Order not found" });
    }

    user.addresses.push({
      order, firstName,lastName,address, specific, subDistrict, district, city, postal, email, phone, smsPromotion,emailPromotion
    });

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
    } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});


//Signin with cookies
router.post("/cookie/signIn", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Incorrect password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h", // 12 hour expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    // Set token in HttpOnly cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 720 * 60 * 1000, // 12 hour
    });

    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: userObject,
    }), // send some safe public info if needed
    await user.save();

  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});


//Signout to clear cookies
router.post("/auth/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

//Check a Token
router.get("/auth/profile",authCookie, async (req, res) => {
  const user = await User.findById(req.user.user._id).select("-password"); // exclude password
  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  res.status(200).json({ error: false, user });
});

export default router;
