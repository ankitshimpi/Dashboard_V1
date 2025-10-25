import * as XLSX from "xlsx";

export type DataRow = {
  [key: string]: string | number | null;
  Accounts?: string;
  Month?: string; // "January", "February", ...
  Week?: string; // "WK 01", "WK 02", ...
};

// A calculated column definition
export type CalcColumn = {
  name: string;     // e.g. "%Spend"
  formula: string;  // e.g. "(Spend / Sales) * 100"
};

// Parse uploaded file (csv / xlsx / xls)
export function parseFileToRows(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) {
        reject("No data in file");
        return;
      }

      const workbook = XLSX.read(data, { type: "binary" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<DataRow>(worksheet, {
        raw: false,
        defval: null,
      });
      resolve(json);
    };

    // always read binary, works for CSV and Excel
    reader.readAsBinaryString(file);
  });
}

// unique Accounts list for dropdown
export function getUniqueAccounts(rows: DataRow[]): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    if (r.Accounts && typeof r.Accounts === "string") {
      set.add(r.Accounts);
    }
  });
  return Array.from(set).sort();
}

// unique Months list
export function getUniqueMonths(rows: DataRow[]): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    if (r.Month && typeof r.Month === "string" && r.Month.trim() !== "") {
      set.add(r.Month.trim());
    }
  });

  // If you want natural calendar order:
  const order = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return Array.from(set).sort((a,b) => order.indexOf(a) - order.indexOf(b));
}

// unique Weeks list
export function getUniqueWeeks(rows: DataRow[]): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    if (r.Week && typeof r.Week === "string" && r.Week.trim() !== "") {
      set.add(r.Week.trim());
    }
  });
  // sort WK 01, WK 02, WK 10 etc.
  return Array.from(set).sort((a,b) => {
    const na = parseInt(a.replace(/[^0-9]/g,""),10);
    const nb = parseInt(b.replace(/[^0-9]/g,""),10);
    return na - nb;
  });
}

// filter rows by selected Accounts
export function filterByAccounts(
  rows: DataRow[],
  selected: string[]
): DataRow[] {
  if (selected.length === 0) return rows;
  return rows.filter((r) => selected.includes(String(r.Accounts)));
}

// filter rows by selected Months or Weeks depending on mode
export function filterByPeriods(
  rows: DataRow[],
  mode: "month" | "week",
  selectedPeriods: string[]
): DataRow[] {
  if (selectedPeriods.length === 0) return rows;
  if (mode === "month") {
    return rows.filter(
      (r) => selectedPeriods.includes(String(r.Month ?? "").trim())
    );
  } else {
    return rows.filter(
      (r) => selectedPeriods.includes(String(r.Week ?? "").trim())
    );
  }
}

// basic table search
export function searchRows(rows: DataRow[], q: string): DataRow[] {
  if (!q.trim()) return rows;
  const lower = q.toLowerCase();
  return rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val ?? "").toLowerCase().includes(lower)
    )
  );
}

// export rows to csv/xlsx
export function exportToCSV(rows: DataRow[], filename = "export.csv") {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename);
}

/**
 * Apply calculated columns to the dataset.
 * calcColumns is an array of { name, formula }.
 * formula can reference other numeric columns, e.g. "(Spend / Sales) * 100".
 * We'll evaluate per row.
 */
export function applyCalculatedColumns(
  rows: DataRow[],
  calcColumns: CalcColumn[]
): DataRow[] {
  if (calcColumns.length === 0) return rows;

  return rows.map((row) => {
    const newRow = { ...row };

    for (const calc of calcColumns) {
      const { name, formula } = calc;

      // Build a scope with the row's numeric values.
      // Example: Spend=123, Sales=456 -> available as Spend, Sales in formula.
      const scopeKeys = Object.keys(newRow);
      const scopeVals = scopeKeys.map((k) => {
        const v = newRow[k];
        const num = typeof v === "string" ? Number(v) : (v as number);
        return isNaN(num) ? 0 : num;
      });

      try {
        // create function with args = column names, body = return <formula>
        // e.g. new Function("Spend","Sales", "return (Spend / Sales) * 100;")
        const fn = new Function(
          ...scopeKeys,
          `return (${formula});`
        ) as (...args: number[]) => number;

        const result = fn(...scopeVals);

        newRow[name] = Number.isFinite(result) ? result : null;
      } catch (err) {
        // if formula fails we just set null
        newRow[name] = null;
      }
    }

    return newRow;
  });
}

/**
 * Summarize rows by period (Month or Week) for a single metric.
 * This is used by the chart.
 *
 * Returns:
 *   labels: ["January","February",...] OR ["WK 01","WK 02",...]
 *   data:   [1234, 5678, ...] totals of that metric
 */
export function summarizeMetricByPeriod(
  rows: DataRow[],
  mode: "month" | "week",
  metric: string
): { labels: string[]; data: number[] } {
  const bucket: Record<string, number> = {};

  rows.forEach((row) => {
    const period =
      mode === "month"
        ? String(row.Month ?? "").trim()
        : String(row.Week ?? "").trim();

    if (!period) return;

    const rawVal = row[metric];
    const num =
      typeof rawVal === "string" ? Number(rawVal) : (rawVal as number);
    const safe = isNaN(num) ? 0 : num;

    if (!bucket[period]) bucket[period] = 0;
    bucket[period] += safe;
  });

  // sort labels in a "natural" way depending on mode
  let labels = Object.keys(bucket);

  if (mode === "month") {
    const order = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    labels = labels.sort(
      (a, b) => order.indexOf(a) - order.indexOf(b)
    );
  } else {
    labels = labels.sort((a, b) => {
      const na = parseInt(a.replace(/[^0-9]/g, ""), 10);
      const nb = parseInt(b.replace(/[^0-9]/g, ""), 10);
      return na - nb;
    });
  }

  const data = labels.map((lbl) => bucket[lbl]);

  return { labels, data };
}

/**
 * Compute conditional formatting guidance between two periods.
 *
 * We’ll look at up to 2 periods (like Month A vs Month B or Week 01 vs Week 02).
 * We return a map:
 *   formatting[account][periodValue][metric] = "worse" | "better" | "same"
 *
 * "Worse" is defined by some business rules:
 *   - Higher is bad: ACOS, CPC
 *   - Lower is bad: ROAS, CTR
 */
export function buildConditionalFormattingMap(
  rows: DataRow[],
  mode: "month" | "week",
  selectedPeriods: string[],
  metricsToWatch: string[]
) {
  // only makes sense if user picked exactly two periods
  if (selectedPeriods.length !== 2) return {};

  const periodKey = mode === "month" ? "Month" : "Week";
  const [p1, p2] = selectedPeriods; // compare p2 vs p1
  // aggregate by account+period for each metric
  // agg[account][period][metric] = sum
  const agg: Record<string, Record<string, Record<string, number>>> = {};

  rows.forEach((row) => {
    const acct = String(row.Accounts ?? "").trim();
    const per = String(row[periodKey] ?? "").trim();
    if (!acct || !per) return;
    if (!selectedPeriods.includes(per)) return;

    if (!agg[acct]) agg[acct] = {};
    if (!agg[acct][per]) agg[acct][per] = {};

    metricsToWatch.forEach((m) => {
      const rawVal = row[m];
      const num =
        typeof rawVal === "string" ? Number(rawVal) : (rawVal as number);
      const safe = isNaN(num) ? 0 : num;
      if (!agg[acct][per][m]) agg[acct][per][m] = 0;
      agg[acct][per][m] += safe;
    });
  });

  // now decide worse/better
  // higher is bad: ACOS, CPC
  // lower is bad: ROAS, CTR
  const higherBad = ["ACOS", "CPC"];
  const lowerBad = ["ROAS", "CTR"];

  const formatting: Record<
    string,
    Record<string, Record<string, "worse" | "better" | "same">>
  > = {};

  Object.keys(agg).forEach((acct) => {
    formatting[acct] = {};
    [p1, p2].forEach((per) => {
      formatting[acct][per] = {};
    });

    metricsToWatch.forEach((m) => {
      const v1 = agg[acct][p1]?.[m] ?? 0;
      const v2 = agg[acct][p2]?.[m] ?? 0;

      let status: "worse" | "better" | "same" = "same";

      if (higherBad.includes(m)) {
        // if v2 > v1 it's worse
        if (v2 > v1) status = "worse";
        else if (v2 < v1) status = "better";
      } else if (lowerBad.includes(m)) {
        // if v2 < v1 it's worse
        if (v2 < v1) status = "worse";
        else if (v2 > v1) status = "better";
      } else {
        // default: higher is better
        if (v2 > v1) status = "better";
        else if (v2 < v1) status = "worse";
      }

      // assign to p2 only (current period), p1 can stay "same"
      formatting[acct][p2][m] = status;
      formatting[acct][p1][m] = "same";
    });
  });

  return formatting;
}

// helper to get cell color class from the formatting map
export function getConditionalClass(
  formattingMap: ReturnType<typeof buildConditionalFormattingMap>,
  accountName: string,
  periodVal: string,
  colName: string
): string {
  const state = formattingMap?.[accountName]?.[periodVal]?.[colName];
  if (state === "worse") {
    return "bg-red-50 text-red-700 font-semibold";
  }
  if (state === "better") {
    return "bg-green-50 text-green-700 font-semibold";
  }
  return "";
}
