import express from "express";
import { Payment } from "../../models/Payment.js";
import { Order } from "../../models/Order.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Create new payment document
router.post("/:orderId", async (req, res) => {
    const { firstName = '', lastName = '', amount, method, status ="pending", cardName = '', cardNumber = '', cvv = '' } = req.body;

    if ( !lastName || !firstName  || !amount || !method || !status || !cardName || !cardNumber || !cvv ) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
        }
    const {orderId} = req.params

    try {
        const existingOrder = await Order.findOne({orderId: orderId});
        if(existingOrder) {
            res.status(404).json({
                error: true,
                message : "No Order found"
            });
        }
        const payment = new Payment({ orderId, firstName, lastName,amount, method, status, cardName, cardNumber, cvv });

        await payment.save();
        res.status(201).json({
            error : false,
            message : "Payment register succesful",
            payment
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Sever error",
            detail: err.message
        })
    }
});

//Update order status ("pending", "completed", "failed", "refunded")
router.patch("/:paymentId", async (req, res) => {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status ) {
        return res.status(400).json({
            error: true,
            message: "Status not found"
        })
    }

    try {
        const existingPayment = await Payment.findOne({ _id: paymentId });

        if(!existingPayment) {
            return res.status(404).json({
                err: true,
                message: "Payment not found or Incorrect payment ID"
            });
        }

        const updatedPayment = await Payment.updateOne(
            { _id: paymentId },
            { $set: { status: status } },
            { new: true }
        )
        return res.status(200).json({
            err : false,
            message: "Update Successed",
            detail: updatedPayment
        })


    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Sever error",
            detail: err.message
        })
    }
});

export default router;