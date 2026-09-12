import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Wishlist from "../models/Wishlist.js";

// Category images mapping for categories
const CATEGORY_IMAGES = {
  Fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80",
  Vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
  Grains: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
  Organic: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
  Dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
  Spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
  Seeds: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80",
  Other: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
};

// @desc    Get Farmer Dashboard Statistics & Activities
// @route   GET /api/dashboard/farmer
// @access  Private (Farmer only)
export const getFarmerDashboardStats = async (req, res, next) => {
  try {
    const farmerId = req.user._id;
    const farmer = await User.findById(farmerId);

    // 1. Real total products listed by this farmer
    const totalProducts = await Product.countDocuments({ farmer: farmerId });

    // 2. Real total orders containing this farmer's products
    const totalOrders = await Order.countDocuments({ "orderItems.farmer": farmerId });

    // 3. Real pending orders for this farmer
    const pendingOrders = await Order.countDocuments({
      "orderItems.farmer": farmerId,
      orderStatus: { $in: ["Pending", "Confirmed", "Processing"] },
    });

    // 4. Real total revenue calculated from non-cancelled order items
    const revenueResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    };

    // 5. Build real activity feed from latest product additions & order updates
    const recentProducts = await Product.find({ farmer: farmerId })
      .sort({ createdAt: -1 })
      .limit(3);

    const recentOrders = await Order.find({ "orderItems.farmer": farmerId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(3);

    const recentActivities = [];

    recentOrders.forEach((ord) => {
      const farmerItems = ord.orderItems.filter(
        (it) => it.farmer && it.farmer.toString() === farmerId.toString()
      );
      const itemNames = farmerItems.map((i) => `${i.quantity} ${i.unit} ${i.name}`).join(", ");
      recentActivities.push({
        id: `ord-${ord._id}`,
        type: "order_received",
        title: `Order #${ord.orderNumber} ${ord.orderStatus}`,
        timestamp: new Date(ord.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        details: `Customer: ${ord.user?.name || "Consumer"} • ${itemNames || "Produce"} (₹${ord.totalAmount})`,
      });
    });

    recentProducts.forEach((prod) => {
      recentActivities.push({
        id: `prod-${prod._id}`,
        type: "product_added",
        title: `Harvest Listed: ${prod.name}`,
        timestamp: new Date(prod.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        details: `Stock: ${prod.quantity} ${prod.unit} @ ₹${prod.price}/${prod.unit}`,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Farmer dashboard data fetched successfully",
      farmer: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        avatar: farmer.avatar,
      },
      stats,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Consumer/User Dashboard Statistics & Produce Recommendations
// @route   GET /api/dashboard/consumer
// @access  Private (Consumer/User only)
export const getConsumerDashboardStats = async (req, res, next) => {
  try {
    const consumerId = req.user._id;
    const consumer = await User.findById(consumerId);

    // 1. Real total orders for this consumer
    const totalOrders = await Order.countDocuments({ user: consumerId });

    // 2. Real wishlist items count
    const wishlistItems = await Wishlist.countDocuments({ user: consumerId });

    // 3. Real total active produce available
    const totalProduceAvailable = await Product.countDocuments({ isAvailable: true });

    const stats = {
      totalOrders,
      wishlistItems,
      recentlyViewed: totalProduceAvailable,
    };

    // 4. Real category counts from Product collection
    const categoryCountsAgg = await Product.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          firstImg: { $first: "$images" },
        },
      },
    ]);

    const featuredCategories = categoryCountsAgg.map((cat) => {
      let image = CATEGORY_IMAGES[cat._id] || CATEGORY_IMAGES.Other;
      if (cat.firstImg && cat.firstImg.length > 0) {
        const rawUrl = typeof cat.firstImg[0] === 'string' ? cat.firstImg[0] : cat.firstImg[0]?.url;
        if (rawUrl) image = rawUrl;
      }
      return {
        id: cat._id.toLowerCase(),
        name: cat._id,
        image,
        count: `${cat.count} produce items`,
      };
    });

    // 5. Fetch real recommended products
    const rawRecommended = await Product.find({ isAvailable: true })
      .populate("farmer", "name location")
      .sort({ createdAt: -1 })
      .limit(4);

    const recommendedProducts = rawRecommended.map((prod) => {
      let img = CATEGORY_IMAGES[prod.category] || CATEGORY_IMAGES.Other;
      if (prod.images && prod.images.length > 0) {
        img = typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0].url;
      }
      return {
        id: prod._id,
        _id: prod._id,
        name: prod.name,
        category: prod.category,
        farmerName: prod.farmer?.name || "Verified Local Farmer",
        price: prod.price,
        unit: prod.unit || "kg",
        rating: 4.8,
        reviewsCount: 12,
        image: img,
      };
    });

    // 6. Fetch real recent orders
    const rawOrders = await Order.find({ user: consumerId })
      .populate("orderItems.farmer", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = rawOrders.map((ord) => {
      const firstItem = ord.orderItems[0];
      return {
        id: ord.orderNumber || ord._id.toString(),
        date: new Date(ord.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        farmer: firstItem?.farmer?.name || "Local Farmer",
        item: `${firstItem?.name || "Produce"} (${ord.orderItems.length} items)`,
        amount: ord.totalAmount,
        status: ord.orderStatus,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Consumer dashboard data fetched successfully",
      consumer: {
        id: consumer._id,
        name: consumer.name,
        email: consumer.email,
        avatar: consumer.avatar,
      },
      stats,
      featuredCategories,
      recommendedProducts,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform Admin Dashboard Overview & Analytics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsersCount = await User.countDocuments();
    const farmersCount = await User.countDocuments({ role: "farmer" });
    const consumersCount = await User.countDocuments({ role: "consumer" });
    const totalProductsCount = await Product.countDocuments();
    const totalOrdersCount = await Order.countDocuments();

    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ["Pending", "Confirmed", "Processing"] },
    });

    // Compute total GMV / Revenue across non-cancelled orders
    const gmvResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = gmvResult.length > 0 ? gmvResult[0].total : 0;

    const stats = {
      totalUsers: totalUsersCount,
      totalFarmers: farmersCount,
      totalConsumers: consumersCount,
      totalProducts: totalProductsCount,
      totalOrders: totalOrdersCount,
      totalRevenue,
      pendingOrders: pendingOrdersCount,
    };

    // Retrieve real recent user registrations
    const recentUsersList = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(6);

    // Retrieve real recent order transactions
    const rawAdminOrders = await Order.find()
      .populate("user", "name")
      .populate("orderItems.farmer", "name")
      .sort({ createdAt: -1 })
      .limit(6);

    const recentOrdersTable = rawAdminOrders.map((ord) => {
      const buyerName = ord.user?.name || "Consumer";
      const farmerName = ord.orderItems[0]?.farmer?.name || "Local Farmer";
      return {
        id: ord.orderNumber || ord._id.toString(),
        customer: buyerName,
        farmer: farmerName,
        product: ord.orderItems.map((i) => i.name).join(", "),
        amount: ord.totalAmount,
        status: ord.orderStatus,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Admin dashboard metrics fetched successfully",
      stats,
      recentUsers: recentUsersList,
      recentOrders: recentOrdersTable,
    });
  } catch (error) {
    next(error);
  }
};
