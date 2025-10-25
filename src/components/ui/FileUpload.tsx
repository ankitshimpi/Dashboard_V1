import { useRef } from "react";
import { parseFileToRows, DataRow } from "../../lib/utils";
import { useToast } from "../../hooks/use-toast";
import { Button } from "./Button";

export default function FileUpload({
  fileName,
  onDataLoaded,
}: {
  fileName: string | null;
  onDataLoaded: (rows: DataRow[], fileName: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  async function handleFile(file: File | null) {
    if (!file) return;
    try {
      const rows = await parseFileToRows(file);
      onDataLoaded(rows, file.name);
      toast("File loaded successfully");
    } catch (err) {
      console.error(err);
      toast("Failed to read file");
    }
  }

  return (
    <div className="border border-dashed border-primary/40 rounded-card bg-white p-6 text-center flex flex-col items-center justify-center gap-4">
      {fileName ? (
        <>
          <div className="flex flex-col items-center gap-2">
            <div className="text-primary">
              <svg
                className="h-12 w-12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline
                  points="14 2 14 8 20 8"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <div className="text-sm font-medium text-textMain">{fileName}</div>
            <div className="text-xs text-textDim">File loaded successfully</div>
          </div>

          <Button
            variant="primary"
            onClick={() => inputRef.current?.click()}
          >
            Change File
          </Button>
        </>
      ) : (
        <>
          <div className="text-slate-500">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5V15"
              />
            </svg>
          </div>

          <div className="text-base font-medium text-textMain">
            Drop your file here
          </div>
          <div className="text-xs text-textDim -mt-2">
            or click to browse (CSV, Excel supported)
          </div>
          <Button
            variant="primary"
            onClick={() => inputRef.current?.click()}
          >
            Select File
          </Button>
        </>
      )}

      <input
        type="file"
        accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        ref={inputRef}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
