import User from "../models/User.js";

// @desc    Get Farmer Dashboard Statistics & Activities
// @route   GET /api/dashboard/farmer
// @access  Private (Farmer only)
export const getFarmerDashboardStats = async (req, res, next) => {
  try {
    const farmer = await User.findById(req.user._id);

    // Initial placeholder/scalable statistics for Farmer
    const stats = {
      totalProducts: 12,
      totalOrders: 48,
      totalRevenue: 24500, // ₹ 24,500
      pendingOrders: 5,
    };

    const recentActivities = [
      {
        id: 1,
        type: "product_added",
        title: "Added Fresh Organic Tomatoes",
        timestamp: "2 hours ago",
        details: "Quantity: 50 kg @ ₹40/kg",
      },
      {
        id: 2,
        type: "order_received",
        title: "Order #FE-8921 Received",
        timestamp: "5 hours ago",
        details: "Consumer: Priya Sharma • 10 kg Alphonso Mangoes",
      },
      {
        id: 3,
        type: "product_updated",
        title: "Updated Stock for Organic Spinach",
        timestamp: "1 day ago",
        details: "New Stock: 30 Bunches",
      },
      {
        id: 4,
        type: "order_shipped",
        title: "Order #FE-8890 Shipped",
        timestamp: "2 days ago",
        details: "Consumer: Ramesh Kumar • Express Delivery",
      },
    ];

    const salesAnalytics = {
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      revenue: [12000, 15000, 18000, 14000, 21000, 22500, 24500],
    };

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
      salesAnalytics,
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
    const consumer = await User.findById(req.user._id);

    const stats = {
      totalOrders: 8,
      cartItems: 3,
      wishlistItems: 12,
      recentlyViewed: 15,
    };

    const featuredCategories = [
      {
        id: "fruits",
        name: "Fresh Fruits",
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80",
        count: "24 items",
      },
      {
        id: "vegetables",
        name: "Organic Vegetables",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        count: "42 items",
      },
      {
        id: "grains",
        name: "Grains & Pulses",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
        count: "18 items",
      },
      {
        id: "organic",
        name: "Dairy & Natural Honey",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
        count: "15 items",
      },
    ];

    const recommendedProducts = [
      {
        id: "prod-1",
        name: "Farm-Fresh Red Tomatoes",
        category: "Vegetables",
        farmerName: "Ramesh Patel (Gujarat)",
        price: 35,
        unit: "kg",
        rating: 4.8,
        reviewsCount: 32,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: "prod-2",
        name: "Organic Ratnagiri Alphonso Mangoes",
        category: "Fruits",
        farmerName: "Suresh Deshmukh (Maharashtra)",
        price: 650,
        unit: "dozen",
        rating: 4.9,
        reviewsCount: 88,
        image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: "prod-3",
        name: "Pure Wildflower Honey",
        category: "Organic",
        farmerName: "Green Earth Farms (Himachal)",
        price: 320,
        unit: "500g",
        rating: 4.7,
        reviewsCount: 19,
        image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=500&q=80",
      },
      {
        id: "prod-4",
        name: "Crisp Green Spinach (Palak)",
        category: "Vegetables",
        farmerName: "Anand Verma (Punjab)",
        price: 25,
        unit: "bunch",
        rating: 4.6,
        reviewsCount: 45,
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=80",
      },
    ];

    const recentOrders = [
      {
        id: "ORD-9081",
        date: "2026-08-01",
        farmer: "Ramesh Patel",
        item: "Organic Tomatoes (5 kg)",
        amount: 175,
        status: "Delivered",
      },
      {
        id: "ORD-9042",
        date: "2026-07-28",
        farmer: "Suresh Deshmukh",
        item: "Alphonso Mangoes (2 dozen)",
        amount: 1300,
        status: "In Transit",
      },
    ];

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

    const stats = {
      totalUsers: totalUsersCount,
      totalFarmers: farmersCount,
      totalConsumers: consumersCount,
      totalProducts: 340,
      totalOrders: 1250,
      totalRevenue: 485000, // ₹ 4,85,000
      pendingOrders: 18,
    };

    // Retrieve recent user registrations
    const recentUsersList = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(6);

    const recentOrdersTable = [
      {
        id: "ORD-9102",
        customer: "Anita Roy",
        farmer: "Ramesh Patel",
        product: "Organic Tomatoes",
        amount: 350,
        status: "Completed",
      },
      {
        id: "ORD-9101",
        customer: "Vikram Singh",
        farmer: "Kisan Farmer Co-op",
        product: "Basmati Rice (25kg)",
        amount: 2200,
        status: "Pending",
      },
      {
        id: "ORD-9100",
        customer: "Priya Sharma",
        farmer: "Suresh Deshmukh",
        product: "Ratnagiri Mangoes",
        amount: 1300,
        status: "Processing",
      },
      {
        id: "ORD-9099",
        customer: "Amitabh Verma",
        farmer: "Green Leaf Organics",
        product: "Fresh Broccoli (2kg)",
        amount: 160,
        status: "Completed",
      },
    ];

    const analyticsData = {
      userGrowth: [
        { month: "Jan", users: 120 },
        { month: "Feb", users: 210 },
        { month: "Mar", users: 340 },
        { month: "Apr", users: 480 },
        { month: "May", users: 690 },
        { month: "Jun", users: 890 },
        { month: "Jul", users: totalUsersCount },
      ],
      salesOverview: [
        { month: "Jan", sales: 45000 },
        { month: "Feb", sales: 62000 },
        { month: "Mar", sales: 85000 },
        { month: "Apr", sales: 95000 },
        { month: "May", sales: 120000 },
        { month: "Jun", sales: 140000 },
        { month: "Jul", sales: 185000 },
      ],
    };

    return res.status(200).json({
      success: true,
      message: "Admin dashboard metrics fetched successfully",
      stats,
      recentUsers: recentUsersList,
      recentOrders: recentOrdersTable,
      analytics: analyticsData,
    });
  } catch (error) {
    next(error);
  }
};
