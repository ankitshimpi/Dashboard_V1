import { useState, useMemo } from "react";
import { Bar, Line, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { DataRow, summarizeMetricByPeriod } from "../../lib/utils";
import { Button } from "./Button";

ChartJS.register(
  // bar / line
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,

  // doughnut
  ArcElement,

  // radar
  RadialLinearScale,

  // shared
  Tooltip,
  Legend
);

type ChartMode = "bar" | "line" | "doughnut" | "radar";

export default function DataChart({
  rows,
  periodMode,
  metricOptions,
}: {
  rows: DataRow[];
  periodMode: "month" | "week";
  metricOptions: string[];
}) {
  // chart type now has more options
  const [chartType, setChartType] = useState<ChartMode>("bar");

  // metric selection
  const [metric, setMetric] = useState<string>(
    metricOptions[0] || "Spend"
  );

  // summarize the metric by Week or Month
  const { labels, dataPoints } = useMemo(() => {
    const { labels, data } = summarizeMetricByPeriod(
      rows,
      periodMode,
      metric
    );
    return { labels, dataPoints: data };
  }, [rows, periodMode, metric]);

  // consistent color per metric
  const colorMap: Record<
    string,
    { bg: string; border: string; point?: string }
  > = {
    Spend: {
      bg: "rgba(26,86,219,0.4)",
      border: "#1a56db",
      point: "#1a56db",
    }, // blue
    Sales: {
      bg: "rgba(16,185,129,0.4)",
      border: "#10b981",
      point: "#10b981",
    }, // green
    ACOS: {
      bg: "rgba(249,115,22,0.4)",
      border: "#f97316",
      point: "#f97316",
    }, // orange
    ROAS: {
      bg: "rgba(225,29,72,0.4)",
      border: "#e11d48",
      point: "#e11d48",
    }, // rose/red
    CTR: {
      bg: "rgba(14,165,233,0.4)",
      border: "#0ea5e9",
      point: "#0ea5e9",
    }, // sky
    Clicks: {
      bg: "rgba(168,85,247,0.4)",
      border: "#a855f7",
      point: "#a855f7",
    }, // purple
    Impressions: {
      bg: "rgba(107,114,128,0.4)",
      border: "#6b7280",
      point: "#6b7280",
    }, // gray
    CPC: {
      bg: "rgba(202,138,4,0.4)",
      border: "#ca8a04",
      point: "#ca8a04",
    }, // amber
    default: {
      bg: "rgba(15,23,42,0.4)",
      border: "#0f172a",
      point: "#0f172a",
    }, // slate
  };

  const palette =
    colorMap[metric] !== undefined
      ? colorMap[metric]
      : colorMap["default"];

  // We build one dataset for now.
  // (later we could let you compare multiple metrics at once).
  const chartData = {
    labels,
    datasets: [
      {
        label: metric,
        data: dataPoints,
        backgroundColor:
          chartType === "bar" || chartType === "doughnut" || chartType === "radar"
            ? palette.bg
            : undefined,
        borderColor: palette.border,
        pointBackgroundColor: palette.point,
        pointBorderColor: palette.point,
        borderWidth: 2,
        fill: chartType === "line" || chartType === "radar" ? true : false,
        tension: chartType === "line" ? 0.35 : 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false as const,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          color: "#0f172a",
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    // Only applies to cartesian charts (bar, line)
    scales:
      chartType === "bar" || chartType === "line"
        ? {
            x: {
              ticks: { color: "#4b5563" },
              grid: { color: "#e5e7eb" },
            },
            y: {
              ticks: { color: "#4b5563" },
              grid: { color: "#e5e7eb" },
            },
          }
        : {},
    // Radar has radial scale, Doughnut doesn't need axes
  };

  // Decide which chart component to render
  function renderChart() {
    if (labels.length === 0) {
      return (
        <div className="text-sm text-textDim text-center">
          No chartable data.
          <br />
          Make sure your data includes a{" "}
          {periodMode === "week" ? "Week" : "Month"} column and
          numeric values for the selected metric.
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return <Bar data={chartData} options={commonOptions} />;
      case "line":
        return <Line data={chartData} options={commonOptions} />;
      case "doughnut":
        return (
          <div className="w-full max-w-[280px]">
            <Doughnut data={chartData} options={commonOptions} />
          </div>
        );
      case "radar":
        return (
          <div className="w-full max-w-[360px]">
            <Radar data={chartData} options={commonOptions} />
          </div>
        );
      default:
        return <Bar data={chartData} options={commonOptions} />;
    }
  }

  return (
    <section className="card mb-6">
      <div className="card-header">
        <div className="card-title">Analytics</div>
        <div className="card-description">
          View trends and comparisons across time periods
        </div>
      </div>

      <div className="card-body">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          {/* Left cluster: chart type + metric */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col text-xs text-textDim">
              <span className="mb-1 font-medium text-textMain text-xs">
                Chart Type
              </span>
              <select
                className="input text-sm w-[150px]"
                value={chartType}
                onChange={(e) =>
                  setChartType(e.target.value as ChartMode)
                }
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="doughnut">Doughnut</option>
                <option value="radar">Radar</option>
              </select>
            </div>

            <div className="flex flex-col text-xs text-textDim">
              <span className="mb-1 font-medium text-textMain text-xs">
                Metric
              </span>
              <select
                className="input text-sm w-[150px]"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                {metricOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right cluster: period display */}
          <div className="flex flex-col text-xs text-textDim">
            <span className="mb-1 font-medium text-textMain text-xs">
              Period
            </span>
            <select
              className="input text-sm w-[160px]"
              value={periodMode}
              disabled
            >
              <option value="week">Week vs Week</option>
              <option value="month">Month vs Month</option>
            </select>
            <span className="text-[10px] text-textDim mt-1">
              (Change this in "Period Mode" above)
            </span>
          </div>
        </div>

        {/* Chart display */}
        <div className="w-full h-[320px] border border-border rounded-card bg-white p-4 flex items-center justify-center">
          {renderChart()}
        </div>
      </div>
    </section>
  );
}
