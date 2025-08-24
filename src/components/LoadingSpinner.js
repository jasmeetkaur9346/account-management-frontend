import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex space-x-2">
        <span className="h-4 w-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="h-4 w-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="h-4 w-4 bg-blue-500 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
