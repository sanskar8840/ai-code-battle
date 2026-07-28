import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!storedUser,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const persistSession = (user, token) => {
  localStorage.setItem("user", JSON.stringify(user));
  if (token) localStorage.setItem("token", token);
};

const clearSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export const signup = createAsyncThunk("auth/signup", async (payload, thunkAPI) => {
  try {
    return await authService.signup(payload);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const login = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    return await authService.login(payload);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await authService.logout();
    return true;
  } catch (err) {
    // Even if the server call fails, we still clear local session state.
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, thunkAPI) => {
  try {
    const data = await authService.getMe();
    return data.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async (email, thunkAPI) => {
  try {
    return await authService.forgotPassword(email);
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, password }, thunkAPI) => {
    try {
      return await authService.resetPassword(resetToken, password);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, thunkAPI) => {
  try {
    const data = await authService.updateProfile(payload);
    return data.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    // Used when we already have a token but need to hydrate user from /me
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // signup + login share the same shape of response
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        persistSession(action.payload.user, action.payload.token);
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        persistSession(action.payload.user, action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.status = "idle";
        clearSession();
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        clearSession();
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "failed";
        state.user = null;
        state.isAuthenticated = false;
        clearSession();
      })

      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        persistSession(action.payload.user, action.payload.token);
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
      });
  },
});

export const { clearAuthError, setUser, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
