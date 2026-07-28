import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiCheckCircle } from "react-icons/fi";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { forgotPassword } from "../../features/auth/authSlice";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    setIsLoading(true);
    const result = await dispatch(forgotPassword(email));
    setIsLoading(false);

    if (result.meta.requestStatus === "fulfilled") {
      setSent(true);
    } else {
      toast.error(result.payload || "Something went wrong. Please try again.");
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-pass/10 text-pass">
          <FiCheckCircle size={24} />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold">Check your inbox</h1>
        <p className="mt-2 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
          If that email is registered, we've sent a link to reset your password. It expires in 10 minutes.
        </p>
        <Link to="/login" className="btn-secondary mt-6 inline-flex">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Forgot your password?</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        Enter your email and we'll send you a reset link.
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

        <Button type="submit" isLoading={isLoading} className="w-full">
          Send reset link
        </Button>

        <Link to="/login" className="block text-center font-body text-sm text-duel-500 hover:underline">
          Back to log in
        </Link>
      </form>
    </div>
  );
};

export default ForgotPassword;
