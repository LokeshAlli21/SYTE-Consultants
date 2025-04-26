import React from "react";

const Button = ({ children, type = "button", onClick, variant = "primary", className = "" }) => {
  const baseClasses = "rounded-full font-semibold px-6 py-2 transition-all duration-300";
  
  const variants = {
    primary: "bg-[#5CAAAB] text-white hover:bg-[#489394]",
    secondary: "border border-[#5CAAAB] text-[#5CAAAB] hover:bg-[#e6f7f7]",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
