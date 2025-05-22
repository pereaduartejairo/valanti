// src/components/ui/Input.jsx
import React from "react";

export const Input = React.forwardRef(
  ({ type = "text", className = "", ...props }, ref) => {
    return (
      <input
        type={type}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input"; // Buena práctica para DevTools

// Puedes exportarlo también como default si prefieres, pero la importación nombrada actual es { Input }
// export default Input;