"use client";

import type { SVGProps } from "react";

export interface RatingIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

/** lucide-react has no chili pepper — hand-drawn to match its stroke
 * conventions (24x24 viewBox, round caps/joins, fill inherited from the
 * root so the RatingPicker's filled/outline toggle keeps working). */
export function ChiliPepperIcon({ size = 20, strokeWidth = 1.75, ...props }: RatingIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8.3 3.6c1.3-1.4 3.2-1.7 4.3-.7" />
      <path d="M12.3 4.1c2.6.4 4.6 2.5 4.8 5.1.3 3.7-1.8 7.9-5.2 10.3-2.4 1.7-5.1 1.8-6.5.2s-.7-4.2 1.4-6.6c2.7-3.2 3.3-7 5.5-9z" />
    </svg>
  );
}

/** Fortune-teller crystal ball -- a sphere on a small stand with a shine
 * highlight, for the "misterio" rating. */
export function CrystalBallIcon({ size = 20, strokeWidth = 1.75, ...props }: RatingIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="10" r="6.5" />
      <path d="M9 7.4c1-1.2 2.9-1.7 4.1-1" />
      <path d="M7.3 18.5h9.4l-1.4 2.6a1 1 0 0 1-.9.5H9.6a1 1 0 0 1-.9-.5z" />
    </svg>
  );
}
