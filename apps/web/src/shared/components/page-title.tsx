import { Sparkles } from "lucide-react";

/**
 * Every page's <h1>, wrapped with the same gold underline + star detail
 * from the Notas page header (reuses its exact CSS classes so it's
 * pixel-identical, not just similar).
 */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="notes-page-header">
      <h1>{children}</h1>
      <div className="notes-title-divider" aria-hidden="true">
        <span className="notes-divider-line" />
        <Sparkles size={14} className="notes-divider-icon" />
      </div>
    </div>
  );
}
