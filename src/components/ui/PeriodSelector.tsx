import { useState, useRef, useEffect } from "react";
import { Badge } from "./Badge";
import { cn } from "../../lib/cn";

export default function PeriodSelector({
  mode,
  allPeriods,
  selected,
  onChange,
}: {
  mode: "month" | "week";
  allPeriods: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function togglePeriod(p: string) {
    if (selected.includes(p)) {
      onChange(selected.filter((x) => x !== p));
    } else {
      onChange([...selected, p]);
    }
  }

  const label =
    mode === "month" ? "Filter by Month(s)" : "Filter by Week(s)";

  return (
    <div className="card mb-6">
      <div className="card-header">
        <div className="card-title">{label}</div>
      </div>

      <div className="card-body">
        <div className="relative" ref={wrapperRef}>
          <button
            type="button"
            className={cn(
              "input flex items-center justify-between cursor-pointer",
              "text-left"
            )}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="truncate text-slate-500">
              {selected.length === 0
                ? mode === "month"
                  ? "Select month(s)..."
                  : "Select week(s)..."
                : `${selected.length} selected`}
            </span>
            <span className="ml-2 text-slate-400 text-xs">▼</span>
          </button>

          {open && (
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-white shadow-lg">
              {allPeriods.length === 0 ? (
                <div className="px-3 py-2 text-sm text-textDim">
                  No periods found
                </div>
              ) : (
                allPeriods.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-textMain hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selected.includes(p)}
                      onChange={() => togglePeriod(p)}
                    />
                    <span className="truncate">{p}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selected.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
