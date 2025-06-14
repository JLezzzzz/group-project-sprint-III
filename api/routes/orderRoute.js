import express from "express";
import { Order, OrderItem } from "../../models/Order.js";
import { Cart } from "../../models/Cart.js";
import mongoose from "mongoose";
import { authCookie } from "../../middlewares/authCookie.js";

const router = express.Router();

router.get("/getUserOrders/:userId", async (req,res) => {
    const {userId} = req.params;

    try{
    const existUser = await User.find(userId )
    if (!existUser) {
        return res.status(404).json({error: true,message: "User Not found"})
    }

    return res.status(200).json({ error: false, existOrder, message: "Order detailed retreived"});

    } catch(err){
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }
})

router.get("/:orderId", async (req,res) => {
    const {orderId} = req.params;
    if (!orderId) {
        return res.status(400).json({error: true,message: "The information is not fulfilled"})
    }

    try{
    const existOrder = await Order.findById(orderId).populate({
        path: "items.productId",
        model: "Product1"
    });

    if (!existOrder) {
        return res.status(404).json({error: true,message: "Order not found"})
    }
        return res.status(200).json({ error: false, existOrder, message: "Order detailed retreived"});

    } catch(err){
        return res.status(500).json({error: true, message: "Server error", details: err.message })
    }
})

//Update order status ('pending', 'paid', 'shipped', 'delivered', 'cancelled')
router.patch("/:orderId", async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
        return res.status(400).json({ error: true, message: "The information is not fulfilled" });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ error: true, message: "Order not found" });
        }

        return res.status(200).json({ error: false, order: updatedOrder, message: "Order status updated" });

    } catch (err) {
        return res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
});


router.post("/createOrder", authCookie, async (req, res) => {
    const userId = req.user.user._id;

    if (!userId) {
        return res.status(404).json({ error: true, message: "Please login first" });
    }

    const { items = [], shippingMethod, status = "To be delivered", total, address = {}, payment = {}, vat = 7 } = req.body;

    if (!items.length || !shippingMethod || !total || !Object.keys(address).length || !Object.keys(payment).length) {
        return res.status(400).json({ error: true, message: "The information is not fulfilled" });
    }

    try {
        const order = await Order.create({
            userId,
            items,
            status,
            total,
            vat,
            address,
            payment,
            shippingMethod
        });
        return res.status(200).json({ error: false, order });
    } catch (error) {
        console.error('Error while creating order:', error);
        return res.status(500).json({ error: true, message: "Server error", details: error.message });
    }
});





export default router