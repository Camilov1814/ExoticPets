import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchUserAttributes
} from 'aws-amplify/auth';
import awsConfig from '../aws-config';

// Configure Amplify
Amplify.configure(awsConfig);

// Async thunks for auth operations
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });

      if (isSignedIn) {
        // Get user attributes after successful sign in
        const userAttributes = await fetchUserAttributes();

        return {
          user: {
            userId: userAttributes.sub,
            email: userAttributes.email || email,
            name: userAttributes.name || userAttributes.email,
            emailVerified: userAttributes.email_verified === 'true'
          }
        };
      } else {
        throw new Error(`Sign in requires additional steps: ${nextStep.signInStep}`);
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.name || error.code
      });
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      });

      return {
        user: {
          userId: null, // Will be available after confirmation
          email,
          name,
          emailVerified: false
        },
        needsConfirmation: !isSignUpComplete
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.name || error.code
      });
    }
  }
);

export const confirmSignUpCode = createAsyncThunk(
  'auth/confirmSignUp',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      return { confirmed: isSignUpComplete };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.name || error.code
      });
    }
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
      return {};
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.name || error.code
      });
    }
  }
);

export const getCurrentAuthUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();

      return {
        user: {
          userId: userAttributes.sub,
          email: userAttributes.email,
          name: userAttributes.name || userAttributes.email,
          emailVerified: userAttributes.email_verified === 'true'
        }
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        code: error.name || error.code
      });
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  needsConfirmation: false,
  pendingEmail: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNeedsConfirmation: (state) => {
      state.needsConfirmation = false;
      state.pendingEmail = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.needsConfirmation = false;
      state.pendingEmail = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload.needsConfirmation) {
          state.needsConfirmation = true;
          state.pendingEmail = action.payload.user.email;
        } else {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Confirm Sign Up
      .addCase(confirmSignUpCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmSignUpCode.fulfilled, (state) => {
        state.loading = false;
        state.needsConfirmation = false;
        state.pendingEmail = null;
        state.error = null;
      })
      .addCase(confirmSignUpCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Sign Out
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      // Get Current User
      .addCase(getCurrentAuthUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentAuthUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentAuthUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  }
});

export const { clearError, clearNeedsConfirmation, logout } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectNeedsConfirmation = (state) => state.auth.needsConfirmation;
export const selectPendingEmail = (state) => state.auth.pendingEmail;

export default authSlice.reducer;