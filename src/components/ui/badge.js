import React from "react";

export const Badge = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 shadow-sm",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm",
    outline: "border-2 border-gray-300 text-gray-700 bg-white/50 backdrop-blur-sm shadow-sm",
    success: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm",
    warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 shadow-sm",
    danger: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 shadow-sm",
  };

  return (
    <span
      className={`inline-flex items-center text-sm font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:shadow-md ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
