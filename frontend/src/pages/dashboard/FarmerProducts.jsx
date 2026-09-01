import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import ProductCard from '../../components/products/ProductCard';
import AddProductModal from '../../components/products/AddProductModal';
import EditProductModal from '../../components/products/EditProductModal';
import {
  getFarmerProductsApi,
  deleteProductApi,
  updateStockQuantityApi,
} from '../../api/productApi';
import {
  Plus,
  Search,
  Package,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Grains',
  'Organic',
  'Dairy',
  'Spices',
  'Seeds',
  'Other',
];

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchFarmerProducts();
  }, []);

  const fetchFarmerProducts = async () => {
    try {
      setLoading(true);
      const res = await getFarmerProductsApi();
      setProducts(res.products || []);
    } catch (err) {
      console.error('Error fetching farmer products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductCreated = (newProduct) => {
    setProducts([newProduct, ...products]);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(
      products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProductApi(product._id);
        setProducts(products.filter((p) => p._id !== product._id));
        toast.success(`Deleted "${product.name}"`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      const res = await updateStockQuantityApi(productId, newQuantity);
      setProducts(
        products.map((p) => (p._id === productId ? res.product : p))
      );
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  // Filtered Products List
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Metrics
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.quantity > 0).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);

  return (
    <DashboardLayout title="My Harvest Produce Listings">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Manage Produce Inventory 🌾
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add new crops, adjust stock availability, and update direct pricing
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>List New Produce</span>
          </button>
        </div>

        {/* Inventory Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Listed</span>
              <h4 className="text-lg font-black text-slate-900">{totalProducts} Items</h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Stock</span>
              <h4 className="text-lg font-black text-emerald-600">{inStockCount} Produce</h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Out of Stock</span>
              <h4 className="text-lg font-black text-red-600">{outOfStockCount} Produce</h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stock</span>
              <h4 className="text-lg font-black text-slate-900">{totalUnits} Units</h4>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search my products..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <span className="text-xs text-slate-400 font-semibold self-end sm:self-center">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleEditClick}
                onDelete={handleDeleteProduct}
                onUpdateStock={handleUpdateStock}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-md text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No Produce Listings Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm || selectedCategory !== 'All'
                  ? 'No products match your current search or category filter.'
                  : "You haven't listed any farm produce yet. Click below to add your first product."}
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>List Your First Crop</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onProductCreated={handleProductCreated}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />
    </DashboardLayout>
  );
};

export default FarmerProducts;
