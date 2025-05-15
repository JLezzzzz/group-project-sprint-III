import express  from "express";

const authRoute = express.Router();

authRoute.post("src/contex/AuthContext.jsx", loginUser)

export default authRoute;