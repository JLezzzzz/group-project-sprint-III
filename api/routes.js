import express from "express"
import productRoute from "./routes/productRoute.js"
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoute.js";
import paymentRoute from "./routes/paymentRoute.js"
import orderRoute from "./routes/orderRoute.js";
// import diyRoute from "./routes/diyRoute.js";



const router = express.Router()


router.use("/order",orderRoute);
router.use("/user",userRoute);
router.use("/product",productRoute);
router.use("/cart",cartRoute);
router.use("/payment",paymentRoute);
// router.use("/diy",diyRoute);


export default router;