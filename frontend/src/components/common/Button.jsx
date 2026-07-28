import Spinner from "./Spinner";

/**
 * variant: "primary" | "secondary"
 * isLoading: shows a spinner and disables the button, but keeps its width stable.
 */
const Button = ({
  children,
  variant = "primary",
  isLoading = false,
  type = "button",
  className = "",
  disabled = false,
  ...rest
}) => {
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${base} ${className}`}
      {...rest}
    >
      {isLoading && <Spinner size="sm" className="text-white" />}
      {children}
    </button>
  );
};

export default Button;
