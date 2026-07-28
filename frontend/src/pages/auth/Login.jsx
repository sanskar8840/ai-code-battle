import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Welcome back!");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Log in</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        New here?{" "}
        <Link to="/register" className="font-medium text-duel-500 hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email}
          registration={register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
          })}
        />

        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            registration={register("password", { required: "Password is required" })}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="font-body text-xs text-duel-500 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} className="w-full">
          Log in
        </Button>
      </form>
    </div>
  );
};

export default Login;
