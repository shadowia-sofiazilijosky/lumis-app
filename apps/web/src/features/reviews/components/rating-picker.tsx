"use client";

const SCALE = [1, 2, 3, 4, 5];

interface RatingPickerProps {
  label: string;
  icon: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

/** Generic 1-5 icon picker — reused for the star rating, spicy (chiles) and romance (corazones). */
export function RatingPicker({ label, icon, value, onChange }: RatingPickerProps) {
  return (
    <div className="rating-picker">
      <span className="rating-picker-label">{label}</span>
      <div className="rating-picker-icons">
        {SCALE.map((step) => (
          <button
            key={step}
            type="button"
            className={`rating-picker-icon ${value !== null && step <= value ? "rating-picker-icon-filled" : ""}`}
            aria-label={`${step} de 5`}
            aria-pressed={value === step}
            onClick={() => onChange(value === step ? null : step)}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
