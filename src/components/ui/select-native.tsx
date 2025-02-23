import { ComponentPropsWithoutRef, forwardRef } from "react";

export interface SelectNativeProps extends ComponentPropsWithoutRef<"select"> {}

export const SelectNative = forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 ${className}`}
        {...props}
      />
    );
  }
);
