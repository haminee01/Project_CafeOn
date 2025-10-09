import React from "react";

/**
 * @param className
 */
export default function Spinner({
  className = "w-6 h-6 border-4",
}: {
  className?: string;
}) {
  return (
    <div
      className={`${className} border-t-transparent border-[#6E4213] border-solid rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
