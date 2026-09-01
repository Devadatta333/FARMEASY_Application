import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please select a product category"],
      enum: {
        values: [
          "Fruits",
          "Vegetables",
          "Grains",
          "Organic",
          "Dairy",
          "Spices",
          "Seeds",
          "Other",
        ],
        message: "Please select a valid agricultural category",
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please add a product description"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    unit: {
      type: String,
      required: [true, "Please specify a unit (e.g. kg, dozen, bunch, litre)"],
      default: "kg",
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Please specify available inventory quantity"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          default: "",
        },
      },
    ],
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product must belong to a farmer"],
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: Automatically compute stock availability based on quantity
productSchema.pre("save", function (next) {
  this.isAvailable = this.quantity > 0;
  next();
});

// Virtual property for human-readable stock status
productSchema.virtual("stockStatus").get(function () {
  return this.quantity > 0 ? "In Stock" : "Out of Stock";
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
