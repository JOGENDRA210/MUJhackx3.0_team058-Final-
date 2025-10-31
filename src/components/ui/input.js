import React from "react";

export const Input = ({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
  id,
  required = false,
  disabled = false,
  step,
  min,
  max,
  onKeyPress
}) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    step={step}
    min={min}
    max={max}
    className={`border-2 border-gray-200 rounded-xl px-4 py-3 w-full bg-white/50 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  />
);
