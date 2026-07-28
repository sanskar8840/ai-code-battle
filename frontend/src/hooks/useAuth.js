import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  login as loginThunk,
  signup as signupThunk,
  logout as logoutThunk,
  clearAuthError,
} from "../features/auth/authSlice";

/**
 * Thin convenience wrapper so components don't need to import
 * useDispatch/useSelector + every thunk individually.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, status, error } = useSelector((state) => state.auth);

  const login = useCallback((payload) => dispatch(loginThunk(payload)), [dispatch]);
  const signup = useCallback((payload) => dispatch(signupThunk(payload)), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: status === "loading",
    error,
    login,
    signup,
    logout,
    clearError,
  };
};

export default useAuth;
