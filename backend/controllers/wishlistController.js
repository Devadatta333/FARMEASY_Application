import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .populate({
        path: "product",
        populate: {
          path: "farmer",
          select: "name email phone location avatar",
        },
      })
      .sort({ createdAt: -1 });

    // Filter out null products in case a referenced product was deleted
    const validItems = wishlist.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      count: validItems.length,
      wishlist: validItems.map((item) => item.product),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ message: "Product is already in your wishlist" });
    }

    await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist! ❤️",
      productId,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Product is already in your wishlist" });
    }
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!result) {
      return res.status(404).json({ message: "Product not found in your wishlist" });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      productId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get array of wishlisted product IDs for current user
// @route   GET /api/wishlist/ids
// @access  Private
export const getWishlistIds = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).select("product");
    const ids = items.map((item) => item.product.toString());

    return res.status(200).json({
      success: true,
      wishlistIds: ids,
    });
  } catch (error) {
    next(error);
  }
};
