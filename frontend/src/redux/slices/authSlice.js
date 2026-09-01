import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  registerApi,
  loginApi,
  googleAuthApi,
  getMeApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../../api/authApi';

// Initial token from localStorage
const storedToken = localStorage.getItem('farmeasy_token');

const initialState = {
  user: null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
  successMessage: null,
};

// Async Thunks
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerApi(userData);
      if (data.token) {
        localStorage.setItem('farmeasy_token', data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginApi(credentials);
      if (data.token) {
        localStorage.setItem('farmeasy_token', data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Invalid email/username or password.'
      );
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (googleData, { rejectWithValue }) => {
    try {
      const data = await googleAuthApi(googleData);
      if (data.token) {
        localStorage.setItem('farmeasy_token', data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Google authentication failed.'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMeApi();
      return data;
    } catch (error) {
      localStorage.removeItem('farmeasy_token');
      return rejectWithValue(
        error.response?.data?.message || 'Session expired. Please log in again.'
      );
    }
  }
);

export const requestForgotPassword = createAsyncThunk(
  'auth/requestForgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const data = await forgotPasswordApi(emailData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send reset link.'
      );
    }
  }
);

export const executeResetPassword = createAsyncThunk(
  'auth/executeResetPassword',
  async ({ resetToken, password }, { rejectWithValue }) => {
    try {
      const data = await resetPasswordApi(resetToken, { password });
      if (data.token) {
        localStorage.setItem('farmeasy_token', data.token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Password reset failed. Invalid or expired token.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('farmeasy_token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Me
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Forgot Password
      .addCase(requestForgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestForgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(requestForgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password
      .addCase(executeResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeResetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
      })
      .addCase(executeResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;
