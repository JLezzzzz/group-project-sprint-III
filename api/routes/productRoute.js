import express from "express";
import { Product } from "../../models/Product.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const {
    styleName,
    productType,
    description,
    price,
    sizes,
    colors,
    tag = [],
    images,
  } = req.body;
  if (
    !styleName ||
    !productType ||
    !description ||
    !price ||
    !sizes ||
    !colors ||
    !images
  ) {
    return res
      .status(400)
      .json({ error: true, message: "The information is not fulfilled" });
  }

  try {
    const product = new Product({
      styleName,
      productType,
      description,
      price,
      sizes,
      colors,
      tag,
      images,
    });
    await product.save();
    return res
      .status(200)
      .json({ error: false, product, message: "Create product successful" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }
    res.status(200).json({
      error: false,
      products,
      message: "s found",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

// GET product by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id });
    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }
    res.status(200).json({
      error: false,
      product,
      message: "product found",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

export default router;
