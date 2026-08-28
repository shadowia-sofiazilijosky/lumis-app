"use client";

import type { LibraryDistributionEntry } from "@lumis/shared-types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DISTRIBUTION_LABEL } from "../lib/presentation";
import { SectionHeading } from "./section-heading";

const BUCKET_COLOR: Record<LibraryDistributionEntry["bucket"], string> = {
  READ: "#8c2f39",
  TO_READ: "#c9a44c",
  READING: "#6b7b4f",
  OTHER: "#b8a378",
};

export function LibraryPieChart({ distribution }: { distribution: LibraryDistributionEntry[] }) {
  const withBooks = distribution.filter((entry) => entry.count > 0);

  return (
    <div className="profile-panel">
      <SectionHeading icon="/assets/profile/icon-perfil-torta.png" title="Tu biblioteca" />

      {withBooks.length === 0 ? (
        <p className="profile-empty-message">Todavía no agregaste libros a tu biblioteca.</p>
      ) : (
        <>
          <div className="profile-pie-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={withBooks}
                  dataKey="count"
                  nameKey="bucket"
                  innerRadius={0}
                  outerRadius={95}
                  paddingAngle={1}
                >
                  {withBooks.map((entry) => (
                    <Cell key={entry.bucket} fill={BUCKET_COLOR[entry.bucket]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={((value: number, _name: unknown, item: { payload: LibraryDistributionEntry }) => [
                    `${value} libros (${item.payload.percent}%)`,
                    DISTRIBUTION_LABEL[item.payload.bucket],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- recharts' Formatter generics don't line up cleanly with a typed payload
                  ]) as any}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--foreground)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="profile-pie-legend">
            {distribution.map((entry) => (
              <li key={entry.bucket}>
                <span
                  className="profile-pie-legend-dot"
                  style={{ background: BUCKET_COLOR[entry.bucket] }}
                />
                {DISTRIBUTION_LABEL[entry.bucket]}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
