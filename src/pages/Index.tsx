import { useState, useMemo } from "react";
import FileUpload from "../components/ui/FileUpload";
import AccountSelector from "../components/ui/AccountSelector";
import PeriodSelector from "../components/ui/PeriodSelector";
import CalculatedColumnForm from "../components/ui/CalculatedColumnForm";
import DataChart from "../components/ui/DataChart";
import DataTable from "../components/ui/DataTable";

import {
  DataRow,
  CalcColumn,
  applyCalculatedColumns,
  filterByAccounts,
  filterByPeriods,
  getUniqueAccounts,
  getUniqueMonths,
  getUniqueWeeks,
  buildConditionalFormattingMap,
} from "../lib/utils";

export default function Index() {
  // uploaded data
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<DataRow[]>([]);

  // filters
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [periodMode, setPeriodMode] = useState<"month" | "week">("week");
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);

  // calculated columns definitions
  const [calcColumns, setCalcColumns] = useState<CalcColumn[]>([]);

  function handleDataLoaded(newRows: DataRow[], fname: string) {
    setRows(newRows);
    setFileName(fname);
    setSelectedAccounts([]);
    setSelectedPeriods([]);
  }

  function handleAddCalculatedColumn(name: string, formula: string) {
    setCalcColumns((prev) => [...prev, { name, formula }]);
  }

  // step 1: add calculated columns into data
  const rowsWithCalcs = useMemo(() => {
    return applyCalculatedColumns(rows, calcColumns);
  }, [rows, calcColumns]);

  // step 2: account filter
  const accountFilteredRows = useMemo(
    () => filterByAccounts(rowsWithCalcs, selectedAccounts),
    [rowsWithCalcs, selectedAccounts]
  );

  // step 3: period filter
  const periodFilteredRows = useMemo(
    () => filterByPeriods(accountFilteredRows, periodMode, selectedPeriods),
    [accountFilteredRows, periodMode, selectedPeriods]
  );

  // collect unique Accounts / Months / Weeks for dropdowns
  const allAccounts = useMemo(
    () => getUniqueAccounts(rowsWithCalcs),
    [rowsWithCalcs]
  );

  const allMonths = useMemo(
    () => getUniqueMonths(rowsWithCalcs),
    [rowsWithCalcs]
  );

  const allWeeks = useMemo(
    () => getUniqueWeeks(rowsWithCalcs),
    [rowsWithCalcs]
  );

  // metric options for the chart dropdown:
  // take all numeric-like columns from data
  const metricOptions = useMemo(() => {
    const nums = new Set<string>();

    rowsWithCalcs.forEach((r) => {
      Object.entries(r).forEach(([key, val]) => {
        const n =
          typeof val === "string" ? Number(val) : (val as number);
        if (!isNaN(n) && key !== "Week" && key !== "Month") {
          nums.add(key);
        }
      });
    });

    return Array.from(nums);
  }, [rowsWithCalcs]);

  // build conditional formatting map (for table coloring)
  const formattingMap = useMemo(() => {
    return buildConditionalFormattingMap(
      periodFilteredRows,
      periodMode,
      selectedPeriods,
      metricOptions
    );
  }, [periodFilteredRows, periodMode, selectedPeriods, metricOptions]);

  // which list of periods to show?
  const periodList = periodMode === "week" ? allWeeks : allMonths;

  return (
    <div className="flex flex-col gap-6">
      {/* UPLOAD */}
      <section className="card">
        <div className="card-header">
          <div className="card-title">Upload Data</div>
        </div>
        <div className="card-body">
          <FileUpload
            fileName={fileName}
            onDataLoaded={handleDataLoaded}
          />
        </div>
      </section>

      {/* ACCOUNT FILTER */}
      <AccountSelector
        allAccounts={allAccounts}
        selected={selectedAccounts}
        onChange={setSelectedAccounts}
      />

      {/* PERIOD MODE TOGGLE + PERIOD SELECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* left side: which mode (Week vs Month) */}
        <div className="card mb-0">
          <div className="card-header">
            <div className="card-title">Period Mode</div>
            <div className="card-description">
              Choose how you want to compare time
            </div>
          </div>
          <div className="card-body flex flex-col gap-2">
            <label className="text-xs font-medium text-textMain">
              Period Type
            </label>
            <select
              className="input text-sm max-w-xs"
              value={periodMode}
              onChange={(e) =>
                setPeriodMode(e.target.value as "week" | "month")
              }
            >
              <option value="week">Week vs Week</option>
              <option value="month">Month vs Month</option>
            </select>
            <div className="text-xs text-textDim">
              This also controls chart grouping and conditional
              formatting.
            </div>
          </div>
        </div>

        {/* right side: select which weeks / months */}
        <PeriodSelector
          mode={periodMode}
          allPeriods={periodList}
          selected={selectedPeriods}
          onChange={setSelectedPeriods}
        />
      </div>

      {/* CALCULATED COLUMN BUILDER */}
      <CalculatedColumnForm onAddColumn={handleAddCalculatedColumn} />

      {/* CHART */}
      <DataChart
        rows={periodFilteredRows}
        periodMode={periodMode}
        metricOptions={metricOptions}
      />

      {/* TABLE */}
      <DataTable
        rows={periodFilteredRows}
        periodMode={periodMode}
        formattingMap={formattingMap}
      />
    </div>
  );
}
