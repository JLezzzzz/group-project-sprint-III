import express from "express";
import mongoose from "mongoose";
import {User} from "../../models/User.js"
import { Cart, CartItem } from "../../models/Cart.js";

const router = express.Router();

//-------------------------------Create a cart------------------------------------
router.post("/", async (req, res) => {
  const {
    sessionId = "",
    userId,
    items = [],
    status = "active",
    total = 0,
    vat = 7,
  } = req.body;
  if (!userId) {
    return res
      .status(400)
      .json({ error: true, message: "The information is not fulfilled" });
  }

  const existingUser = await User.findOne(userId)
  if (existingUser) {
    return res.status(200).send("Cart is already created")
  }


  try {
    const cart = new Cart({
      sessionId,
      userId: new mongoose.Types.ObjectId(userId),
      items:
        items?.map((item) => ({
          ...item,
          productId: new mongoose.Types.ObjectId(item.productId),
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          selectedImage: item.selectedImage,
          unitPrice: item.unitPrice || 0,
        })) || [], // Handle case where items might be undefined
      status,
      total,
      vat,
    });
    await cart.save();

    return res.status(201).json({
      error: false,
      cart,
      message: "The cart is create successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//-------------------------------Get a cart--------------------------------------
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({
      error: true,
      message: "The information is not fulfilled",
    });
  }

  try {
    const existCart = await Cart.findOne({ userId: userId });
    if (!existCart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }
    return res.status(200).json({
      error: false,
      cart: existCart,
      message: "Cart detailed retreived",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//------------------------------- Add item to cart-------------------------------
router.post("/:userId/items", async (req, res) => {
  const { userId } = req.params;
  const {
    productId,
    quantity = 1,
    unitPrice,
    selectedColor,
    selectedSize,
    selectedImage,
  } = req.body;

  if (
    !productId ||
    !quantity ||
    !unitPrice ||
    !selectedColor ||
    !selectedSize ||
    !selectedImage
  ) {
    return res.status(400).json({
      error: true,
      message: "Please complete all required product details",
    });
  }

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    // create new obj.Id for user CartItem and _id item in cart
    const newItemId = new mongoose.Types.ObjectId();

    // create item for push into cart.items use new _id ที่ createจากข้างบน
    const newItemInCart = {
      _id: newItemId,
      cartId: cart._id,
      productId,
      quantity,
      unitPrice,
      selectedSize,
      selectedColor,
      selectedImage,
    };

    // Update item in cart
    cart.items.push(newItemInCart);

    // create CartItem
    const cartItem = new CartItem(newItemInCart);

    // save CartItem
    await cartItem.save();

    // update total and updatedAt
    cart.total += quantity * unitPrice;

    // save cart
    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      message: "Item added to cart successfully",
    });
  } catch (err) {
    console.error("Error adding item to cart:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//-------------------------------Delete an cart-item and update cart total price-------------------------------
//Add the cartId to find the cart first, and then find the item within that cart.
router.delete("/:cartId/item/:itemId", async (req, res) => {
  const { cartId, itemId } = req.params;
  // console.log(`userId: ${userId}, itemId: ${itemId}`);

  try {
    // check that the cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ error: true, message: "Cart not found" });
    }

    console.log(cart);

    const embeddedItemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    console.log(embeddedItemIndex);

    if (embeddedItemIndex >= 0) {
      // Store the price of that item first; if you delete it, you won't know its price
      const itemTotal = cart.items[embeddedItemIndex].totalPrice;

      // delete item from arry
      cart.items.splice(embeddedItemIndex, 1);

      // update Total
      cart.total -= itemTotal;

      await cart.save();

      return res.status(200).json({
        error: false,
        message: "Cart item deleted from embedded items and cart total updated",
        updatedCart: cart,
      });
    }

    return res.status(404).json({
      error: true,
      message: "Cart item not found in embedded in Cart",
    });
  } catch (err) {
    console.error("Error in delete cart item:", err);
    return res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
});

//-------------------------------Get a populated cart-------------------------------
router.get("/populated/:userId", async (req, res) => {
  try {
    const userId = req.params.userId; //add .userId to find the userId value directly

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: "Product1",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ error: false, cart });
  } catch (error) {
    console.error("Error in /populated/:userId route:", error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
});

//Update when user added cart-item to cart

//Create a cart-item to when user added to cart

// -------------------------------Update color'item-------------------------------
router.patch("/:cartId/items/:itemId/color", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { selectedColor } = req.body;

  if (!selectedColor) {
    return res.status(400).json({
      error: true,
      message: "Selected color is required",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    item.selectedColor = selectedColor;

    cart.updatedAt = new Date();

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item color updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});
// -------------------------------Update size'item-------------------------------
router.patch("/:cartId/items/:itemId/size", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { selectedSize } = req.body;

  if (!selectedSize) {
    return res.status(400).json({
      error: true,
      message: "Selected size is required",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    item.selectedSize = selectedSize;

    cart.updatedAt = new Date();

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item size updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

//-------------------------------Update quantity-------------------------------
router.patch("/:cartId/items/:itemId/quantity", async (req, res) => {
  const { cartId, itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({
      error: true,
      message: "Valid quantity is required (must be greater than 0)",
    });
  }

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    const oldTotal = item.quantity * item.unitPrice;

    item.quantity = quantity;
    cart.updatedAt = new Date();

    const newTotal = item.quantity * item.unitPrice;
    cart.total = cart.total - oldTotal + newTotal;

    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item quantity updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

// -------------------------------Update cart item details by itenId (color, size, quantity)-------------------------------
router.patch("/items/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const { selectedColor, selectedSize, quantity, selectedImage } = req.body;

  try {
    // Find CartItem by itemId
    const cartItem = await CartItem.findById(itemId);
    if (!cartItem) {
      return res.status(404).json({
        error: true,
        message: "Cart item not found",
      });
    }

    // Get cartId from the CartItem
    const cartId = cartItem.cartId;

    // Find Cart
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({
        error: true,
        message: "Cart not found",
      });
    }

    // Find item within the cart's items array
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        error: true,
        message: "Item not found in cart",
      });
    }

    let isUpdated = false;

    if (selectedColor !== undefined) {
      item.selectedColor = selectedColor;
      cartItem.selectedColor = selectedColor;
      isUpdated = true;
    }

    if (selectedSize !== undefined) {
      item.selectedSize = selectedSize;
      cartItem.selectedSize = selectedSize;
      isUpdated = true;
    }

    if (selectedImage !== undefined) {
      item.selectedImage = selectedImage;
      cartItem.selectedImage = selectedImage;
      isUpdated = true;
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        return res.status(400).json({
          error: true,
          message: "Valid quantity is required (must be greater than 0)",
        });
      }

      const oldTotal = item.quantity * item.unitPrice;
      item.quantity = quantity;
      cartItem.quantity = quantity;

      const newTotal = item.quantity * item.unitPrice;
      cartItem.totalPrice = newTotal; // Update totalPrice in CartItem
      cart.total = cart.total - oldTotal + newTotal;
      isUpdated = true;
    }

    if (!isUpdated) {
      return res.status(400).json({
        error: true,
        message:
          "No valid update parameters provided (selectedColor, selectedSize, or quantity)",
      });
    }

    // save cartItem
    await cartItem.save();
    cart.updatedAt = new Date();

    // save cart
    await cart.save();

    return res.status(200).json({
      error: false,
      cart,
      item,
      message: "Item details updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Server error",
      details: err.message,
    });
  }
});

export default router;
