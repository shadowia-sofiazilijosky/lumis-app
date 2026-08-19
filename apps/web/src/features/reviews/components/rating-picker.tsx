"use client";

import type { LucideIcon } from "lucide-react";

const SCALE = [1, 2, 3, 4, 5];

interface RatingPickerProps {
  label: string;
  icon: LucideIcon;
  tone: "star" | "spicy" | "romance";
  value: number | null;
  onChange: (value: number | null) => void;
}

/** Generic 1-5 icon picker — reused for the star rating, spicy (chiles) and romance (corazones). */
export function RatingPicker({ label, icon: Icon, tone, value, onChange }: RatingPickerProps) {
  return (
    <div className="rating-picker">
      <span className="rating-picker-label">{label}</span>
      <div className="rating-picker-icons">
        {SCALE.map((step) => {
          const filled = value !== null && step <= value;
          return (
            <button
              key={step}
              type="button"
              className={`rating-picker-icon rating-picker-icon-${tone} ${filled ? "rating-picker-icon-filled" : ""}`}
              aria-label={`${step} de 5`}
              aria-pressed={value === step}
              onClick={() => onChange(value === step ? null : step)}
            >
              <Icon size={20} fill={filled ? "currentColor" : "none"} strokeWidth={1.75} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
