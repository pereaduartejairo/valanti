import React, { useState, useRef, useEffect } from "react";

export const Select = ({ children, onValueChange, defaultValue }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || "");
  const selectRef = useRef();

  const handleItemClick = (value) => {
    setSelected(value);
    onValueChange?.(value);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const enhancedChildren = React.Children.map(children, (child) => {
    if (child.type.displayName === "SelectTrigger") {
      return React.cloneElement(child, {
        onClick: () => setOpen(!open),
        selected,
      });
    }
    if (child.type.displayName === "SelectContent") {
      return open
        ? React.cloneElement(child, {
            onItemSelect: handleItemClick,
            selected,
          })
        : null;
    }
    return child;
  });

  return (
    <div ref={selectRef} className="relative w-full">
      {enhancedChildren}
    </div>
  );
};

export const SelectTrigger = ({ onClick, selected }) => (
  <div
    onClick={onClick}
    className="w-full px-4 py-2 border rounded bg-white text-left cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-300"
  >
    <SelectValue value={selected} />
  </div>
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ value }) => (
  <span className="text-gray-700">
    {value ? value : "Selecciona una opción"}
  </span>
);

export const SelectContent = ({ children, onItemSelect, selected }) => (
  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        onSelect: onItemSelect,
        selected,
      })
    )}
  </div>
);
SelectContent.displayName = "SelectContent";

export const SelectItem = ({ children, value, onSelect, selected }) => (
  <div
    onClick={() => onSelect(value)}
    className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
      selected === value ? "bg-blue-50 font-medium" : ""
    }`}
  >
    {children}
  </div>
);
