const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

const Spinner = ({ size = "md", className = "" }) => {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-duel-500 ${sizeMap[size]} ${className}`}
    />
  );
};

export default Spinner;
