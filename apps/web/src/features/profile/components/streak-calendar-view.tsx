"use client";

import type { StreakCalendarDay, StreakCalendarMonth } from "@lumis/shared-types";
import { ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { fetchStreakCalendar } from "../api/profile-client";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Monday-first weekday index (0-6) for a given day-of-month, in UTC (the
 * calendar's own dates are already plain UTC-midnight day keys). */
function mondayFirstWeekday(year: number, month: number, day: number): number {
  const jsWeekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun
  return (jsWeekday + 6) % 7; // 0=Mon
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function StreakCalendarView() {
  const t = useTranslations("streakCalendar");
  const locale = useLocale();

  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(now.getUTCMonth() + 1); // 1-12
  const [data, setData] = useState<StreakCalendarMonth | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetchStreakCalendar(viewYear, viewMonth)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setStatus("error");
          return;
        }
        setData(result);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [viewYear, viewMonth]);

  const isCurrentMonth = viewYear === now.getUTCFullYear() && viewMonth === now.getUTCMonth() + 1;

  function goToPreviousMonth() {
    if (viewMonth === 1) {
      setViewYear((year) => year - 1);
      setViewMonth(12);
    } else {
      setViewMonth((month) => month - 1);
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return; // no browsing into the future
    if (viewMonth === 12) {
      setViewYear((year) => year + 1);
      setViewMonth(1);
    } else {
      setViewMonth((month) => month + 1);
    }
  }

  function goToToday() {
    setViewYear(now.getUTCFullYear());
    setViewMonth(now.getUTCMonth() + 1);
  }

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(viewYear, viewMonth - 1, 1)));

  // Monday-first short weekday labels, locale-aware.
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2024-01-01 was a Monday -- a fixed, known Monday to format from.
    return Array.from({ length: 7 }, (_, i) =>
      formatter.format(new Date(Date.UTC(2024, 0, 1 + i))),
    );
  }, [locale]);

  const daysByDate = useMemo(() => {
    const map = new Map<string, StreakCalendarDay>();
    for (const day of data?.days ?? []) {
      map.set(day.date, day);
    }
    return map;
  }, [data]);

  const totalDays = daysInMonth(viewYear, viewMonth);
  const leadingBlanks = mondayFirstWeekday(viewYear, viewMonth, 1);
  const today = data?.today;

  return (
    <div className="streak-calendar">
      <div className="streak-calendar-header">
        <button
          type="button"
          className="streak-calendar-nav"
          onClick={goToPreviousMonth}
          aria-label={t("previousMonth")}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="streak-calendar-month-label">
          <span>{monthLabel}</span>
          {!isCurrentMonth && (
            <button type="button" className="streak-calendar-today-button" onClick={goToToday}>
              {t("today")}
            </button>
          )}
        </div>

        <button
          type="button"
          className="streak-calendar-nav"
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          aria-label={t("nextMonth")}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {status === "loading" && <p>{t("loading")}</p>}
      {status === "error" && <p>{t("loadError")}</p>}

      {status === "ready" && (
        <>
          <div className="streak-calendar-weekdays">
            {weekdayLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          <div className="streak-calendar-grid">
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <div key={`blank-${i}`} className="streak-calendar-cell streak-calendar-cell-empty" />
            ))}

            {Array.from({ length: totalDays }, (_, i) => {
              const dayNumber = i + 1;
              const dateKey = `${viewYear}-${pad2(viewMonth)}-${pad2(dayNumber)}`;
              const day = daysByDate.get(dateKey);
              const isToday = dateKey === today;

              return (
                <div
                  key={dateKey}
                  className={`streak-calendar-cell${day ? " streak-calendar-cell-read" : ""}${
                    isToday ? " streak-calendar-cell-today" : ""
                  }`}
                >
                  <span className="streak-calendar-day-number">
                    {dayNumber}
                    {day?.isNight && <Moon size={11} className="streak-calendar-night-icon" />}
                  </span>

                  {day && day.books.length > 0 && (
                    <div className="streak-calendar-covers">
                      {day.books.slice(0, 3).map((book) =>
                        book.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- signed, short-lived Supabase URL
                          <img
                            key={book.id}
                            src={book.coverUrl}
                            alt={book.title}
                            title={book.title}
                            className="streak-calendar-cover"
                          />
                        ) : (
                          <span
                            key={book.id}
                            className="streak-calendar-cover streak-calendar-cover-fallback"
                            title={book.title}
                          >
                            {book.title.slice(0, 1)}
                          </span>
                        ),
                      )}
                      {day.books.length > 3 && (
                        <span className="streak-calendar-covers-more">+{day.books.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
