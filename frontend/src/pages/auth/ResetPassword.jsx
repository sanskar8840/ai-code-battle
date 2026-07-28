import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import { resetPassword } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const password = watch("password");

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Password reset — you're logged in.");
      navigate("/dashboard", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onSubmit = async ({ password }) => {
    const result = await dispatch(resetPassword({ resetToken, password }));
    if (result.meta.requestStatus === "rejected") {
      toast.error(result.payload || "This reset link is invalid or has expired.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 font-body text-sm text-ink-800/60 dark:text-paper-100/60">
        Choose a strong password you haven't used before.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          id="password"
          label="New password"
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
          label="Confirm new password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          registration={register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
        />

        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Reset password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
