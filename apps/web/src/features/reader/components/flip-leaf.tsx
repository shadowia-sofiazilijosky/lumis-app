"use client";

import { forwardRef } from "react";

/** react-pageflip requires each page child to forward its ref to the actual
 * DOM node it measures/animates (see its README's "Advanced Usage"). */
export const FlipLeaf = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  function FlipLeaf({ children }, ref) {
    return (
      <div className="flip-book-page" ref={ref}>
        {children}
      </div>
    );
  },
);
