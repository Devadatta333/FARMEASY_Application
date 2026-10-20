import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// Helper: Parse date range into start, end, and prior equivalent periods
export const parseDateRange = (range, customStart, customEnd) => {
  const now = new Date();
  let startDate;
  let endDate = new Date(now);

  switch (range) {
    case "today": {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      break;
    }
    case "7d": {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "30d": {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "3m": {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "1y": {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case "custom": {
      if (customStart) {
        startDate = new Date(customStart);
        if (customStart.length <= 10) startDate.setHours(0, 0, 0, 0);
      } else {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
      }

      if (customEnd) {
        endDate = new Date(customEnd);
        if (customEnd.length <= 10) endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date(now);
      }
      break;
    }
    default: {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      break;
    }
  }

  // Ensure startDate <= endDate
  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }

  // Calculate prior equivalent period for comparison/growth calculations
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  return { startDate, endDate, prevStartDate, prevEndDate };
};

// Helper: Mask sensitive customer data (e.g. email / phone)
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "Customer";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.slice(0, 2)}***@${domain}`;
};

// @desc    Get Comprehensive Analytics for Authenticated Farmer
// @route   GET /api/dashboard/farmer/analytics
// @access  Private (Farmer only)
export const getFarmerAnalytics = async (req, res, next) => {
  try {
    const farmerId = new mongoose.Types.ObjectId(req.user._id);
    const { range = "30d", startDate: customStart, endDate: customEnd } = req.query;

    const { startDate, endDate, prevStartDate, prevEndDate } = parseDateRange(
      range,
      customStart,
      customEnd
    );

    // =========================================================================
    // 1. SUMMARY KPIs (Current Period vs Prior Period)
    // =========================================================================
    const currentMetricsAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          productsSold: { $sum: "$orderItems.quantity" },
          orderIds: { $addToSet: "$_id" },
          userIds: { $addToSet: "$user" },
        },
      },
    ]);

    const currRevenue = currentMetricsAgg.length > 0 ? currentMetricsAgg[0].totalRevenue : 0;
    const currOrdersCount = currentMetricsAgg.length > 0 ? currentMetricsAgg[0].orderIds.length : 0;
    const currProductsSold = currentMetricsAgg.length > 0 ? currentMetricsAgg[0].productsSold : 0;
    const currUniqueCustomers = currentMetricsAgg.length > 0 ? currentMetricsAgg[0].userIds.length : 0;
    const averageOrderValue =
      currOrdersCount > 0 ? Number((currRevenue / currOrdersCount).toFixed(2)) : 0;

    // Prior period metrics for revenue growth
    const priorMetricsAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: prevStartDate, $lte: prevEndDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          orderIds: { $addToSet: "$_id" },
        },
      },
    ]);

    const prevRevenue = priorMetricsAgg.length > 0 ? priorMetricsAgg[0].totalRevenue : 0;
    const prevOrdersCount = priorMetricsAgg.length > 0 ? priorMetricsAgg[0].orderIds.length : 0;

    let revenueGrowth = 0;
    if (prevRevenue === 0 && currRevenue > 0) {
      revenueGrowth = 100;
    } else if (prevRevenue > 0) {
      revenueGrowth = Number((((currRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1));
    }

    let ordersGrowth = 0;
    if (prevOrdersCount === 0 && currOrdersCount > 0) {
      ordersGrowth = 100;
    } else if (prevOrdersCount > 0) {
      ordersGrowth = Number((((currOrdersCount - prevOrdersCount) / prevOrdersCount) * 100).toFixed(1));
    }

    const summary = {
      revenue: currRevenue,
      orders: currOrdersCount,
      productsSold: currProductsSold,
      customers: currUniqueCustomers,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
      previousRevenue: prevRevenue,
      previousOrders: prevOrdersCount,
      dateRange: {
        range,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        prevStartDate: prevStartDate.toISOString(),
        prevEndDate: prevEndDate.toISOString(),
      },
    };

    // =========================================================================
    // 2. REVENUE TREND (Time-series Timeline)
    // =========================================================================
    // Determine dynamic interval format
    const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const isToday = range === "today" || durationDays <= 1;
    const isYearly = range === "1y" || durationDays > 120;

    let dateFormatString = "%Y-%m-%d";
    if (isToday) dateFormatString = "%Y-%m-%d %H:00";
    else if (isYearly) dateFormatString = "%Y-%m";

    const trendAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: {
            interval: { $dateToString: { format: dateFormatString, date: "$createdAt" } },
            orderId: "$_id",
          },
          orderRevenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: "$_id.interval",
          revenue: { $sum: "$orderRevenue" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build continuous timeline with zero-fill so chart has no missing holes
    const trendMap = new Map();
    trendAgg.forEach((item) => {
      trendMap.set(item._id, { revenue: item.revenue, orders: item.orders });
    });

    const revenueTrend = [];
    if (isToday) {
      // 24 hours of today
      const baseDate = new Date(startDate);
      for (let h = 0; h < 24; h++) {
        const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), h);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(h).padStart(2, "0");
        const key = `${yyyy}-${mm}-${dd} ${hh}:00`;
        const label = `${hh}:00`;
        const record = trendMap.get(key) || { revenue: 0, orders: 0 };
        revenueTrend.push({
          date: label,
          fullDate: key,
          revenue: record.revenue,
          orders: record.orders,
        });
      }
    } else if (isYearly) {
      // Past 12 months
      const cur = new Date(startDate);
      cur.setDate(1);
      while (cur <= endDate) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, "0");
        const key = `${yyyy}-${mm}`;
        const label = cur.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
        const record = trendMap.get(key) || { revenue: 0, orders: 0 };
        revenueTrend.push({
          date: label,
          fullDate: key,
          revenue: record.revenue,
          orders: record.orders,
        });
        cur.setMonth(cur.getMonth() + 1);
      }
    } else {
      // Daily intervals
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, "0");
        const dd = String(cur.getDate()).padStart(2, "0");
        const key = `${yyyy}-${mm}-${dd}`;
        const label = cur.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        const record = trendMap.get(key) || { revenue: 0, orders: 0 };
        revenueTrend.push({
          date: label,
          fullDate: key,
          revenue: record.revenue,
          orders: record.orders,
        });
        cur.setDate(cur.getDate() + 1);
      }
    }

    // =========================================================================
    // 3. ORDER STATUS BREAKDOWN
    // =========================================================================
    const allStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

    const statusAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: {
            orderId: "$_id",
            orderStatus: "$orderStatus",
          },
          orderTotal: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: "$_id.orderStatus",
          count: { $sum: 1 },
          revenue: { $sum: "$orderTotal" },
        },
      },
    ]);

    const statusMap = new Map();
    statusAgg.forEach((s) => statusMap.set(s._id, { count: s.count, revenue: s.revenue }));

    const totalOrdersAllStatuses = statusAgg.reduce((acc, curr) => acc + curr.count, 0);

    const orderStatus = allStatuses.map((status) => {
      const data = statusMap.get(status) || { count: 0, revenue: 0 };
      const percentage =
        totalOrdersAllStatuses > 0 ? Number(((data.count / totalOrdersAllStatuses) * 100).toFixed(1)) : 0;
      return {
        status,
        count: data.count,
        revenue: data.revenue,
        percentage,
      };
    });

    // =========================================================================
    // 4. TOP SELLING PRODUCTS
    // =========================================================================
    const topProductsAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          unit: { $first: "$orderItems.unit" },
          image: { $first: "$orderItems.image" },
          quantitySold: { $sum: "$orderItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          orderIds: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          unit: 1,
          image: 1,
          quantitySold: 1,
          revenue: 1,
          ordersCount: { $size: "$orderIds" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // =========================================================================
    // 5. PRODUCT PERFORMANCE (Full Catalog Breakdown)
    // =========================================================================
    const farmerProducts = await Product.find({ farmer: farmerId }).sort({ createdAt: -1 });

    // Aggregate sales per product for the selected date range
    const productSalesMap = new Map();
    const productSalesAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: "$orderItems.product",
          quantitySold: { $sum: "$orderItems.quantity" },
          revenue: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          orderIds: { $addToSet: "$_id" },
        },
      },
    ]);

    productSalesAgg.forEach((ps) => {
      productSalesMap.set(ps._id.toString(), {
        quantitySold: ps.quantitySold,
        revenue: ps.revenue,
        ordersCount: ps.orderIds.length,
      });
    });

    const productPerformance = farmerProducts.map((p) => {
      const sales = productSalesMap.get(p._id.toString()) || {
        quantitySold: 0,
        revenue: 0,
        ordersCount: 0,
      };

      let stockHealth = "Healthy Stock";
      if (p.quantity === 0) stockHealth = "Out of Stock";
      else if (p.quantity <= 10) stockHealth = "Low Stock";

      let img = "";
      if (p.images && p.images.length > 0) {
        img = typeof p.images[0] === "string" ? p.images[0] : p.images[0]?.url || "";
      }

      return {
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        unit: p.unit || "kg",
        currentStock: p.quantity,
        stockStatus: stockHealth,
        isAvailable: p.isAvailable,
        image: img,
        unitsSold: sales.quantitySold,
        revenue: sales.revenue,
        ordersCount: sales.ordersCount,
        rating: null, // Note: FarmEasy does not have a reviews collection yet
      };
    });

    // =========================================================================
    // 6. CUSTOMER ANALYTICS (New vs Returning, Top Customers)
    // =========================================================================
    // Get all valid customer IDs who placed orders with this farmer in range
    const periodCustomersAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$user",
          ordersCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);

    const periodCustomerIds = periodCustomersAgg.map((c) => c._id).filter(Boolean);

    // Determine which of these customers had orders before the start date
    const priorBuyerIds = await Order.distinct("user", {
      user: { $in: periodCustomerIds },
      "orderItems.farmer": farmerId,
      orderStatus: { $ne: "Cancelled" },
      createdAt: { $lt: startDate },
    });

    const priorBuyerSet = new Set(priorBuyerIds.map((id) => id.toString()));

    let newCustomersCount = 0;
    let returningCustomersCount = 0;

    periodCustomerIds.forEach((id) => {
      if (priorBuyerSet.has(id.toString())) {
        returningCustomersCount++;
      } else {
        newCustomersCount++;
      }
    });

    // Top Customers leaderboard in this period
    const topCustomersAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: {
            user: "$user",
            orderId: "$_id",
          },
          orderAmount: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$_id.user",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$orderAmount" },
          lastOrder: { $max: "$createdAt" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$userDetails.name", "Consumer"] },
          email: { $ifNull: ["$userDetails.email", ""] },
          location: { $ifNull: ["$userDetails.location", "Local Area"] },
          avatar: { $ifNull: ["$userDetails.avatar", ""] },
          totalOrders: 1,
          totalSpent: 1,
          lastOrder: 1,
        },
      },
    ]);

    const topCustomers = topCustomersAgg.map((c) => ({
      id: c._id,
      name: c.name,
      maskedEmail: maskEmail(c.email),
      location: c.location || "Verified Buyer",
      avatar: c.avatar,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      lastOrder: c.lastOrder,
    }));

    const customerAnalytics = {
      totalUniqueCustomers: periodCustomerIds.length,
      newCustomers: newCustomersCount,
      returningCustomers: returningCustomersCount,
      topCustomers,
    };

    // =========================================================================
    // 7. INVENTORY HEALTH ANALYTICS
    // =========================================================================
    const LOW_STOCK_THRESHOLD = 10;
    const totalActiveProducts = farmerProducts.filter((p) => p.isAvailable).length;
    const outOfStockProducts = farmerProducts.filter((p) => p.quantity === 0).length;
    const lowStockProducts = farmerProducts.filter(
      (p) => p.quantity > 0 && p.quantity <= LOW_STOCK_THRESHOLD
    ).length;
    const healthyStockProducts = farmerProducts.filter(
      (p) => p.quantity > LOW_STOCK_THRESHOLD
    ).length;

    const inventoryList = farmerProducts.map((p) => {
      let status = "Healthy";
      if (p.quantity === 0) status = "Out of Stock";
      else if (p.quantity <= LOW_STOCK_THRESHOLD) status = "Low Stock";

      return {
        _id: p._id,
        name: p.name,
        category: p.category,
        currentStock: p.quantity,
        unit: p.unit || "kg",
        price: p.price,
        status,
        isAvailable: p.isAvailable,
      };
    });

    const inventory = {
      totalProducts: farmerProducts.length,
      totalActiveProducts,
      healthyStockProducts,
      lowStockProducts,
      outOfStockProducts,
      threshold: LOW_STOCK_THRESHOLD,
      items: inventoryList,
    };

    // =========================================================================
    // 8. EARNINGS BREAKDOWN (FarmEasy Direct Farm-to-Consumer Model)
    // =========================================================================
    const allFarmerOrdersInRange = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $group: {
          _id: "$orderStatus",
          total: {
            $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    let grossSales = 0;
    let cancelledAmount = 0;
    let deliveredEarnings = 0;
    let pendingPayouts = 0;

    allFarmerOrdersInRange.forEach((item) => {
      grossSales += item.total;
      if (item._id === "Cancelled") {
        cancelledAmount += item.total;
      } else if (item._id === "Delivered") {
        deliveredEarnings += item.total;
      } else {
        pendingPayouts += item.total;
      }
    });

    // Net earnings = Gross sales excluding cancelled
    const netFarmerEarnings = grossSales - cancelledAmount;

    const earnings = {
      grossSales,
      cancelledAmount,
      platformFee: 0, // FarmEasy operates 0% middleman fees for registered producers
      platformFeeRate: "0% (Direct Farmer Hub)",
      deliveryFeeIncluded: 0, // Delivery fee is logistics cost handled at platform level
      netFarmerEarnings,
      deliveredEarnings,
      pendingPayouts,
    };

    // =========================================================================
    // 9. PRODUCT CATEGORY ANALYTICS
    // =========================================================================
    // Aggregate category sales by joining orderItems with Product
    const categoryAgg = await Order.aggregate([
      {
        $match: {
          "orderItems.farmer": farmerId,
          orderStatus: { $ne: "Cancelled" },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$orderItems" },
      { $match: { "orderItems.farmer": farmerId } },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      {
        $project: {
          price: "$orderItems.price",
          quantity: "$orderItems.quantity",
          category: {
            $ifNull: [{ $arrayElemAt: ["$productDoc.category", 0] }, "Other"],
          },
        },
      },
      {
        $group: {
          _id: "$category",
          revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          quantitySold: { $sum: "$quantity" },
          itemsCount: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalCategoryRevenue = categoryAgg.reduce((acc, c) => acc + c.revenue, 0);

    const categoryAnalytics = categoryAgg.map((cat) => ({
      category: cat._id,
      revenue: cat.revenue,
      quantitySold: cat.quantitySold,
      itemsCount: cat.itemsCount,
      percentage:
        totalCategoryRevenue > 0
          ? Number(((cat.revenue / totalCategoryRevenue) * 100).toFixed(1))
          : 0,
    }));

    // Return complete payload
    return res.status(200).json({
      success: true,
      message: "Farmer analytics retrieved successfully",
      data: {
        summary,
        revenueTrend,
        orderStatus,
        topProducts: topProductsAgg,
        productPerformance,
        customerAnalytics,
        inventory,
        earnings,
        categoryAnalytics,
      },
    });
  } catch (error) {
    next(error);
  }
};
