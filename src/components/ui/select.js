import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const SelectContext = React.createContext();

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, triggerRef }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className = "" }) => {
  const { isOpen, setIsOpen, triggerRef } = React.useContext(SelectContext);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex h-12 w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-base ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
    >
      {children}
      <svg
        className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

const SelectValue = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);

  return <span className="text-gray-900 font-medium">{value || placeholder}</span>;
};

const SelectContent = ({ children, className = "" }) => {
  const { isOpen, setIsOpen, triggerRef } = React.useContext(SelectContext);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  // coords: top/left/width in px
  const [coords, setCoords] = useState({ top: null, left: null, width: null });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef?.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen, triggerRef]);

  // compute and update position, flip if needed
  const updatePosition = () => {
    const tr = triggerRef?.current;
    const dd = dropdownRef.current;
    if (!tr || !dd) return;
    const rect = tr.getBoundingClientRect();
    const ddHeight = dd.offsetHeight || 0;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    let top;
    if (spaceBelow >= ddHeight + 10) {
      // enough space below
      top = rect.bottom + 5;
    } else if (rect.top >= ddHeight + 10) {
      // open above
      top = rect.top - ddHeight - 5;
    } else {
      // fallback: clamp inside viewport
      top = Math.max(5, Math.min(viewportHeight - ddHeight - 5, rect.bottom + 5));
    }
    setCoords({ top, left: rect.left, width: rect.width });
    setVisible(true);
  };

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }

    // measure after render
    const raf = requestAnimationFrame(() => updatePosition());

    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;
  if (!mounted) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] overflow-hidden rounded-xl border-2 border-gray-200 bg-white text-gray-950 shadow-xl animate-in fade-in-80 slide-in-from-top-2 ${className}`}
      style={{
        top: coords.top != null ? `${coords.top}px` : undefined,
        left: coords.left != null ? `${coords.left}px` : undefined,
        width: coords.width != null ? `${coords.width}px` : undefined,
        visibility: visible ? 'visible' : 'hidden'
      }}
    >
      <div className="p-2">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { onClick: () => setIsOpen(false) })
        )}
      </div>
    </div>,
    document.body
  );
};

const SelectItem = ({ children, value, onClick }) => {
  const { onValueChange } = React.useContext(SelectContext);

  return (
    <div
      className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-3 pl-10 pr-4 text-base outline-none hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150 font-medium"
      onClick={() => {
        onValueChange(value);
        onClick && onClick();
      }}
    >
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
