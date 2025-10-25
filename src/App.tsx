import { Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto w-full max-w-7xl flex items-start gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="3" y="10" width="4" height="10" rx="1" />
              <rect x="10" y="6" width="4" height="14" rx="1" />
              <rect x="17" y="2" width="4" height="18" rx="1" />
            </svg>
          </div>
          <div className="flex flex-col">
            <Link to="/" className="text-lg font-semibold text-textMain">
              Data Analytics Dashboard
            </Link>
            <span className="text-xs text-textDim -mt-0.5">
              Upload, filter, and visualize your data
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
