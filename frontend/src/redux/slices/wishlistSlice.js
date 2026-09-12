import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getWishlistApi,
  getWishlistIdsApi,
  addToWishlistApi,
  removeFromWishlistApi,
} from '../../api/wishlistApi';

const initialState = {
  items: [],
  wishlistIds: [],
  loading: false,
  error: null,
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWishlistApi();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

export const fetchWishlistIds = createAsyncThunk(
  'wishlist/fetchWishlistIds',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getWishlistIdsApi();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist IDs'
      );
    }
  }
);

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleWishlistItem',
  async (product, { getState, rejectWithValue }) => {
    const productId = typeof product === 'string' ? product : product._id;
    const { wishlistIds } = getState().wishlist;
    const isWishlisted = wishlistIds.includes(productId);

    try {
      if (isWishlisted) {
        await removeFromWishlistApi(productId);
        return { productId, action: 'removed', product };
      } else {
        await addToWishlistApi(productId);
        return { productId, action: 'added', product };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Wishlist operation failed'
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.items = [];
      state.wishlistIds = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist Full Items
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist || [];
        state.wishlistIds = (action.payload.wishlist || []).map(
          (item) => item._id
        );
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Wishlist IDs
      .addCase(fetchWishlistIds.fulfilled, (state, action) => {
        state.wishlistIds = action.payload.wishlistIds || [];
      })

      // Toggle Wishlist Item
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { productId, action: type, product } = action.payload;
        if (type === 'added') {
          if (!state.wishlistIds.includes(productId)) {
            state.wishlistIds.push(productId);
          }
          if (typeof product === 'object' && product !== null) {
            state.items.unshift(product);
          }
        } else if (type === 'removed') {
          state.wishlistIds = state.wishlistIds.filter((id) => id !== productId);
          state.items = state.items.filter((item) => item._id !== productId);
        }
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
