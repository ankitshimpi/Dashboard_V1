import { useState } from "react";
import { Button } from "./Button";

export default function CalculatedColumnForm({
  onAddColumn,
}: {
  onAddColumn: (name: string, formula: string) => void;
}) {
  const [colName, setColName] = useState("");
  const [formula, setFormula] = useState("");

  function handleAdd() {
    if (!colName.trim() || !formula.trim()) return;
    onAddColumn(colName.trim(), formula.trim());
    setColName("");
    setFormula("");
  }

  return (
    <div className="card mb-6">
      <div className="card-header">
        <div className="card-title">Add Calculated Column</div>
        <div className="card-description">
          Define a new column using a formula, e.g. (Spend / Sales) * 100
        </div>
      </div>
      <div className="card-body flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-textMain mb-1">
              Column Name
            </label>
            <input
              className="input text-sm"
              placeholder="%Spend"
              value={colName}
              onChange={(e) => setColName(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-medium text-textMain mb-1">
              Formula
            </label>
            <input
              className="input text-sm"
              placeholder="(Spend / Sales) * 100"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Button variant="primary" onClick={handleAdd}>
            Add Column
          </Button>
        </div>

        <div className="text-xs text-textDim leading-relaxed">
          Notes:
          <br />
          • Use existing numeric columns like Spend, Sales, Clicks, etc.
          <br />
          • Result will appear in the table and metric dropdown.
        </div>
      </div>
    </div>
  );
}
