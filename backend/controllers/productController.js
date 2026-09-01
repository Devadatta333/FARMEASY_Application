import Product from "../models/Product.js";
import User from "../models/User.js";
import { uploadProductImage } from "../config/cloudinary.js";

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private (Farmer only)
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, description, price, unit, quantity } = req.body;

    if (!name || !category || !description || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: "Please fill in all required product fields (name, category, description, price, quantity)",
      });
    }

    let productImages = [];

    // Handle Multer uploaded files if present
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImg = await uploadProductImage(file.buffer, file.originalname);
        productImages.push(uploadedImg);
      }
    } else if (req.body.images) {
      // Handle string array of image URLs
      const imageList = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
      productImages = imageList.map((img) =>
        typeof img === "string" ? { url: img, public_id: "" } : img
      );
    }

    // Default image fallback if no image uploaded
    if (productImages.length === 0) {
      productImages.push({
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        public_id: "default_produce",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      unit: unit ? unit.trim() : "kg",
      quantity: Number(quantity),
      images: productImages,
      farmer: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully! 🌾",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products listed by logged-in farmer
// @route   GET /api/products/farmer/my-products
// @access  Private (Farmer only)
export const getFarmerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Seed mock products for public marketplace demonstration if DB is empty
const seedSampleProductsIfEmpty = async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    let farmer = await User.findOne({ role: "farmer" });
    if (!farmer) {
      farmer = await User.create({
        name: "Ramesh Patel (Green Earth Farm)",
        username: "ramesh_farm",
        email: "ramesh.patel@farmeasy.com",
        password: "password123",
        role: "farmer",
        phone: "+91 98765 43210",
        location: "Anand, Gujarat",
      });
    }

    const samples = [
      {
        name: "Fresh Farm Red Tomatoes",
        category: "Vegetables",
        description: "Juicy, naturally ripened vine tomatoes grown organically in rich soil without pesticides.",
        price: 35,
        unit: "kg",
        quantity: 80,
        images: [{ url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80" }],
        farmer: farmer._id,
      },
      {
        name: "Organic Ratnagiri Alphonso Mangoes",
        category: "Fruits",
        description: "Premium GI-tagged Ratnagiri Alphonso mangoes. Handpicked, sweet, and aromatic.",
        price: 650,
        unit: "dozen",
        quantity: 45,
        images: [{ url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" }],
        farmer: farmer._id,
      },
      {
        name: "Pure Himalayan Wildflower Honey",
        category: "Organic",
        description: "Unfiltered, raw natural wildflower honey collected from Himalayan forest bees.",
        price: 320,
        unit: "500g",
        quantity: 25,
        images: [{ url: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80" }],
        farmer: farmer._id,
      },
      {
        name: "Crisp Green Spinach (Palak)",
        category: "Vegetables",
        description: "Farm-fresh dark green spinach leaves packed with iron and natural vitamins.",
        price: 25,
        unit: "bunch",
        quantity: 60,
        images: [{ url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80" }],
        farmer: farmer._id,
      },
      {
        name: "Premium Basmati Rice",
        category: "Grains",
        description: "Aged long-grain aromatic Basmati rice sourced directly from Punjab paddy fields.",
        price: 110,
        unit: "kg",
        quantity: 120,
        images: [{ url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" }],
        farmer: farmer._id,
      },
      {
        name: "Fresh A2 Cow Milk",
        category: "Dairy",
        description: "Pure unprocessed A2 Desi cow milk, delivered fresh every morning.",
        price: 75,
        unit: "litre",
        quantity: 30,
        images: [{ url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80" }],
        farmer: farmer._id,
      },
    ];

    await Product.insertMany(samples);
  }
};

// @desc    Get all products with filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res, next) => {
  try {
    await seedSampleProductsIfEmpty();

    const { category, search, available, sort, minPrice, maxPrice } = req.query;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    if (category && category !== "All") {
      query.category = category;
    }

    if (available === "true") {
      query.quantity = { $gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "price_asc") sortOptions = { price: 1 };
    if (sort === "price_desc") sortOptions = { price: -1 };
    if (sort === "popular") sortOptions = { quantity: -1 };
    if (sort === "latest") sortOptions = { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("farmer", "name email phone location avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer",
      "name email phone location avatar"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product (Owner only)
// @route   PUT /api/products/:id
// @access  Private (Farmer owner only)
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Security Check: Verify product owner matches authenticated user
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const { name, category, description, price, unit, quantity } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (unit) product.unit = unit.trim();
    if (quantity !== undefined) product.quantity = Number(quantity);

    // Handle new uploaded images if provided
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const uploadedImg = await uploadProductImage(file.buffer, file.originalname);
        newImages.push(uploadedImg);
      }
      product.images = newImages;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Owner only)
// @route   DELETE /api/products/:id
// @access  Private (Farmer owner only)
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Security Check: Verify product owner matches authenticated user
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick update product stock quantity
// @route   PATCH /api/products/:id/stock
// @access  Private (Farmer owner only)
export const updateStockQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Please provide a valid non-negative quantity" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Security Check: Verify product owner matches authenticated user
    if (product.farmer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to modify this product inventory" });
    }

    product.quantity = Number(quantity);
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Stock updated to ${product.quantity} ${product.unit}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};
