import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const password = watch("password");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async ({ confirmPassword, ...data }) => {
    const result = await signup(data);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Account created — welcome to the arena!");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Create your account</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        Already battling?{" "}
        <Link to="/login" className="font-medium text-duel-500 hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          id="name"
          label="Full name"
          placeholder="Ada Lovelace"
          error={errors.name}
          registration={register("name", { required: "Name is required" })}
        />

        <Input
          id="username"
          label="Username"
          placeholder="ada_codes"
          error={errors.username}
          registration={register("username", {
            required: "Username is required",
            pattern: {
              value: /^[a-z0-9_]{3,30}$/,
              message: "3-30 chars: lowercase letters, numbers, underscores only",
            },
          })}
        />

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

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password}
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Create account
        </Button>

        <p className="text-center font-body text-xs text-ink-800/50 dark:text-paper-100/50">
          By signing up, you agree to play fair — no plagiarized submissions.
        </p>
      </form>
    </div>
  );
};

export default Register;
