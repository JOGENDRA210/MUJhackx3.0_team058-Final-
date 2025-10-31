import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 ${className}`}>{children}</div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-6 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h2 className={`text-2xl font-bold text-gray-900 ${className}`}>{children}</h2>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-gray-600 text-base leading-relaxed ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);
