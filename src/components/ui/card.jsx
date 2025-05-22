import React from "react";

// Contenedor principal del Card
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white border rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

// Encabezado del Card
export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-4 pt-4 pb-2 border-b font-semibold text-lg ${className}`}>
    {children}
  </div>
);

// Título dentro del CardHeader
export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-gray-900 text-xl font-bold ${className}`}>{children}</h3>
);

// Contenido del Card
export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

// Pie del Card (botones, info final)
export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-4 pt-2 pb-4 border-t text-right ${className}`}>
    {children}
  </div>
);
