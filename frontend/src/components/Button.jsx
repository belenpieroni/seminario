export function Button({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "default",
  size = "md",
}) {
  const baseStyles = "rounded-md transition-all font-medium tracking-wide";

  const variants = {
    default: "bg-red-700 text-white hover:bg-red-800",
    ghost: "bg-[#c41e3a] text-white hover:bg-red-800",
  };

  const sizes = {
    sm: "h-8 w-8 flex items-center justify-center",
    md: "px-4 py-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || ""} ${sizes[size] || ""} ${className}`}
    >
      {children}
    </button>
  );
}
