import React, { useState, useEffect } from "react";

let setToastFunc;

export const Toaster = () => {
  const [toast, setToast] = useState(null);
  setToastFunc = setToast;

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
      {toast}
    </div>
  );
};

export const toast = (msg) => {
  if (setToastFunc) setToastFunc(msg);
};
