import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage if present
const loadInitialCart = () => {
  try {
    const storedCart = localStorage.getItem('farmeasy_cart');
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      return {
        items: parsed.items || [],
        farmerId: parsed.farmerId || null,
        farmerName: parsed.farmerName || null,
        totalItems: parsed.totalItems || 0,
        subtotal: parsed.subtotal || 0,
        deliveryFee: parsed.deliveryFee || 0,
        total: parsed.total || 0,
      };
    }
  } catch (err) {
    console.error('Error loading cart from localStorage', err);
  }
  return {
    items: [],
    farmerId: null,
    farmerName: null,
    totalItems: 0,
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
  };
};

const calculateCartTotals = (items) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Tiered delivery fee calculation: ₹0-299 => ₹60, ₹300-499 => ₹40, ₹500-999 => ₹20, ₹1000+ => FREE
  let deliveryFee = 0;
  if (subtotal > 0) {
    if (subtotal >= 1000) deliveryFee = 0;
    else if (subtotal >= 500) deliveryFee = 20;
    else if (subtotal >= 300) deliveryFee = 40;
    else deliveryFee = 60;
  }

  const total = subtotal + deliveryFee;

  return { totalItems, subtotal, deliveryFee, total };
};

const saveCartToStorage = (state) => {
  try {
    localStorage.setItem('farmeasy_cart', JSON.stringify(state));
  } catch (err) {
    console.error('Error saving cart to localStorage', err);
  }
};

const initialState = loadInitialCart();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payloadProduct = action.payload?.product || action.payload || {};
      const quantity = action.payload?.quantity || payloadProduct?.selectedQuantity || 1;
      const product = payloadProduct;

      // Extract image URL string
      let imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
      if (product.images && product.images.length > 0) {
        imageUrl = typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url;
      } else if (product.image) {
        imageUrl = typeof product.image === 'string' ? product.image : product.image?.url;
      }

      const itemFarmerId = product.farmer?._id || product.farmer || product.farmerId || null;
      const itemFarmerName = product.farmer?.name || product.farmerName || 'Verified Local Farmer';

      if (state.items.length === 0) {
        state.farmerId = itemFarmerId;
        state.farmerName = itemFarmerName;
      }

      const existingIndex = state.items.findIndex((item) => item._id === product._id);

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          unit: product.unit || 'kg',
          category: product.category || 'Produce',
          image: imageUrl,
          farmerId: itemFarmerId,
          farmerName: itemFarmerName,
          quantity: quantity,
          maxStock: product.quantity || 99,
        });
      }

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
      state.deliveryFee = totals.deliveryFee;
      state.total = totals.total;

      saveCartToStorage(state);
    },

    replaceCartWithProduct: (state, action) => {
      const payloadProduct = action.payload?.product || action.payload || {};
      const quantity = action.payload?.quantity || payloadProduct?.selectedQuantity || 1;
      const product = payloadProduct;

      let imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
      if (product.images && product.images.length > 0) {
        imageUrl = typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url;
      } else if (product.image) {
        imageUrl = typeof product.image === 'string' ? product.image : product.image?.url;
      }

      const itemFarmerId = product.farmer?._id || product.farmer || product.farmerId || null;
      const itemFarmerName = product.farmer?.name || product.farmerName || 'Verified Local Farmer';

      state.items = [{
        _id: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit || 'kg',
        category: product.category || 'Produce',
        image: imageUrl,
        farmerId: itemFarmerId,
        farmerName: itemFarmerName,
        quantity: quantity,
        maxStock: product.quantity || 99,
      }];
      state.farmerId = itemFarmerId;
      state.farmerName = itemFarmerName;

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
      state.deliveryFee = totals.deliveryFee;
      state.total = totals.total;

      saveCartToStorage(state);
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item._id !== productId);

      if (state.items.length === 0) {
        state.farmerId = null;
        state.farmerName = null;
      }

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
      state.deliveryFee = totals.deliveryFee;
      state.total = totals.total;

      saveCartToStorage(state);
    },

    updateCartQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i._id !== id);
        } else {
          const max = item.maxStock !== undefined ? item.maxStock : 999;
          item.quantity = Math.min(quantity, max);
        }
      }

      if (state.items.length === 0) {
        state.farmerId = null;
        state.farmerName = null;
      }

      const totals = calculateCartTotals(state.items);
      state.totalItems = totals.totalItems;
      state.subtotal = totals.subtotal;
      state.deliveryFee = totals.deliveryFee;
      state.total = totals.total;

      saveCartToStorage(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.farmerId = null;
      state.farmerName = null;
      state.totalItems = 0;
      state.subtotal = 0;
      state.deliveryFee = 0;
      state.total = 0;

      saveCartToStorage(state);
    },
  },
});

export const { addToCart, replaceCartWithProduct, removeFromCart, updateCartQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
