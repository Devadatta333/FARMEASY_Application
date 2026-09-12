import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc    Create a new customer order
// @route   POST /api/orders
// @access  Private (Consumer / User)
export const createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: "Please provide a complete shipping address" });
    }

    // Phase 1: Verify all products, validate stock availability, and calculate authoritative subtotal
    const verifiedItems = [];
    let calculatedSubtotal = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product || item._id);
      if (!product) {
        return res.status(404).json({ message: `Product "${item.name || 'Produce'}" not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity} ${product.unit}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      const image = product.images && product.images.length > 0 ? (product.images[0].url || product.images[0]) : "";

      verifiedItems.push({
        productDoc: product,
        orderItemData: {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          unit: product.unit || "kg",
          image: typeof image === 'string' ? image : "",
          farmer: product.farmer,
        },
      });
    }

    // Phase 2: Deduct stock inventory safely now that all items are verified
    for (const { productDoc, orderItemData } of verifiedItems) {
      productDoc.quantity -= orderItemData.quantity;
      await productDoc.save();
    }

    const formattedOrderItems = verifiedItems.map((v) => v.orderItemData);

    // Tiered delivery fee calculation: ₹0-299 => ₹60, ₹300-499 => ₹40, ₹500-999 => ₹20, ₹1000+ => FREE
    let deliveryFee = 60;
    if (calculatedSubtotal >= 1000) {
      deliveryFee = 0;
    } else if (calculatedSubtotal >= 500) {
      deliveryFee = 20;
    } else if (calculatedSubtotal >= 300) {
      deliveryFee = 40;
    }

    const totalAmount = calculatedSubtotal + deliveryFee;

    // Save/update address on User model if user profile has empty street address
    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser && (!currentUser.address || !currentUser.address.streetAddress)) {
        currentUser.address = {
          streetAddress: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state || "",
          pincode: shippingAddress.pincode,
        };
        if (!currentUser.location) {
          currentUser.location = `${shippingAddress.city}${shippingAddress.state ? ', ' + shippingAddress.state : ''}`;
        }
        await currentUser.save();
      }
    }

    // Generate unique human-readable order number
    const orderNumber = `FE-ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      orderItems: formattedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: paymentMethod === "Card" || paymentMethod === "UPI" || paymentMethod === "NetBanking" ? "Paid" : "Pending",
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount,
      orderStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! 📦",
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in consumer's order history
// @route   GET /api/orders/my-orders
// @access  Private (Consumer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.farmer", "name email phone location avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders containing produce listed by current farmer
// @route   GET /api/orders/farmer-orders
// @access  Private (Farmer)
export const getFarmerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "orderItems.farmer": req.user._id })
      .populate("user", "name email phone location avatar")
      .sort({ createdAt: -1 });

    // Filter order items to only include items belonging to this farmer for clean farmer view
    const farmerSpecificOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orderItems = orderObj.orderItems.filter(
        (item) => item.farmer && item.farmer.toString() === req.user._id.toString()
      );
      // Calculate farmer's portion of total revenue
      const farmerItemsTotal = orderObj.orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
      orderObj.farmerTotalAmount = farmerItemsTotal;
      orderObj.totalAmount = farmerItemsTotal;
      return orderObj;
    });

    return res.status(200).json({
      success: true,
      count: farmerSpecificOrders.length,
      orders: farmerSpecificOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders across system
// @route   GET /api/orders/admin
// @access  Private (Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email phone location")
      .populate("orderItems.farmer", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone location avatar")
      .populate("orderItems.farmer", "name email phone location avatar");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization: Buyer, involved Farmer, or Admin
    const isBuyer = order.user._id.toString() === req.user._id.toString();
    const isFarmerInvolved = order.orderItems.some(
      (item) => item.farmer && item.farmer._id.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isFarmerInvolved && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Farmer or Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isFarmerInvolved = order.orderItems.some(
      (item) => item.farmer && item.farmer.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === "admin";

    if (!isFarmerInvolved && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this order status" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentStatus = "Paid";
      }
      if (orderStatus === "Cancelled") {
        order.cancelledAt = Date.now();
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${order.orderStatus}"`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order (Customer or Seller/Admin)
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isBuyer = order.user.toString() === req.user._id.toString();
    const isFarmerInvolved = order.orderItems.some(
      (item) => item.farmer && item.farmer.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isFarmerInvolved && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    if (order.orderStatus === "Delivered") {
      return res.status(400).json({ message: "Cannot cancel an order that has already been delivered" });
    }

    if (order.orderStatus === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.orderStatus = "Cancelled";
    order.cancelledAt = Date.now();
    order.cancellationReason = reason || "Cancelled by user";
    await order.save();

    // Restore product stock quantity
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully and product inventory restored",
      order,
    });
  } catch (error) {
    next(error);
  }
};
