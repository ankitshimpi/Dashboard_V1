import { useState, useMemo } from "react";
import {
  DataRow,
  exportToCSV,
  searchRows,
  getConditionalClass,
} from "../../lib/utils";
import { Button } from "./Button";

export default function DataTable({
  rows,
  periodMode,
  formattingMap,
}: {
  rows: DataRow[];
  periodMode: "month" | "week";
  formattingMap: ReturnType<typeof getConditionalClass> extends never
    ? any
    : any; // just keeping TS quiet in this snippet
}) {
  const [search, setSearch] = useState("");

  // visibleRows = after search
  const visibleRows = useMemo(() => {
    return searchRows(rows, search);
  }, [rows, search]);

  // collect all column headers from data
  const columns = useMemo(() => {
    const colSet = new Set<string>();
    rows.forEach((r) => Object.keys(r).forEach((c) => colSet.add(c)));
    return Array.from(colSet);
  }, [rows]);

  const periodKey = periodMode === "week" ? "Week" : "Month";

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <div>
            <div className="card-title flex items-center gap-2">
              <span>Data Table</span>
              <span className="text-xs text-textDim font-normal">
                {visibleRows.length} rows
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative">
              <input
                className="input pr-8 w-full md:w-64"
                placeholder="Search in table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
            </div>

            <Button
              variant="primary"
              onClick={() => exportToCSV(visibleRows)}
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="card-body overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-left font-medium text-textDim px-4 py-2 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-slate-50/50">
            {visibleRows.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                {columns.map((col) => {
                  // We attempt to apply conditional formatting only
                  // if this column is numeric-like and is one of our watched metrics.
                  // We'll look up styling from formattingMap using account + period.
                  const acct = String(row.Accounts ?? "").trim();
                  const perVal = String(row[periodKey] ?? "").trim();
                  const cellClass = getConditionalClass(
                    formattingMap,
                    acct,
                    perVal,
                    col
                  );

                  return (
                    <td
                      key={col}
                      className={`px-4 py-2 text-textMain whitespace-nowrap ${cellClass}`}
                    >
                      {String(row[col] ?? "")}
                    </td>
                  );
                })}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-textDim"
                >
                  No rows match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
