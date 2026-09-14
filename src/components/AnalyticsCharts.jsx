import { useState, useMemo } from "react";
import { formatCurrency } from "../utils/formatCurrency.js";
import { calculateCategoryBreakdown, calculateMonthlyCashflow } from "../utils/analytics.js";

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeDonutArc(x, y, radius, innerRadius, startAngle, endAngle) {
  // Ensure arc doesn't self-intersect if full circle
  const safeEnd = endAngle - startAngle >= 359.99 ? startAngle + 359.99 : endAngle;
  const start = polarToCartesian(x, y, radius, safeEnd);
  const end = polarToCartesian(x, y, radius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, startAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, safeEnd);

  const arcSweep = safeEnd - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
    "L", innerStart.x, innerStart.y,
    "A", innerRadius, innerRadius, 0, arcSweep, 1, innerEnd.x, innerEnd.y,
    "Z"
  ].join(" ");
}

function AnalyticsCharts({ transactions, currentCurrency }) {
  const [timeHorizon, setTimeHorizon] = useState("ALL"); // 7D | 30D | 3M | ALL
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Filter transactions based on selected time horizon
  const filteredTransactions = useMemo(() => {
    if (timeHorizon === "ALL") return transactions;

    const now = new Date();
    const cutoff = new Date();
    if (timeHorizon === "7D") cutoff.setDate(now.getDate() - 7);
    else if (timeHorizon === "30D") cutoff.setDate(now.getDate() - 30);
    else if (timeHorizon === "3M") cutoff.setMonth(now.getMonth() - 3);

    return transactions.filter((t) => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  }, [transactions, timeHorizon]);

  const cashflowData = useMemo(() => calculateMonthlyCashflow(filteredTransactions), [filteredTransactions]);
  const categoryData = useMemo(() => calculateCategoryBreakdown(filteredTransactions), [filteredTransactions]);

  const totalExpenseFiltered = useMemo(() => {
    return categoryData.reduce((acc, c) => acc + c.amount, 0);
  }, [categoryData]);

  // Dimensions for Area / Line Chart
  const svgWidth = 560;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Compute points and cumulative balance trajectory
  const chartPoints = useMemo(() => {
    if (cashflowData.length === 0) return [];
    let runningBalance = 0;
    const maxVal = Math.max(...cashflowData.flatMap((d) => [d.income, d.expense]), 1000);

    return cashflowData.map((d, index) => {
      runningBalance += (d.income - d.expense);
      const x = cashflowData.length === 1
        ? svgWidth / 2
        : paddingX + (index / (cashflowData.length - 1)) * plotWidth;

      const incomeH = (d.income / maxVal) * (plotHeight * 0.85);
      const expenseH = (d.expense / maxVal) * (plotHeight * 0.85);
      const incomeY = svgHeight - paddingY - incomeH;
      const expenseY = svgHeight - paddingY - expenseH;

      return {
        ...d,
        x,
        incomeY,
        expenseY,
        incomeH,
        expenseH,
        runningBalance,
      };
    });
  }, [cashflowData, plotWidth, plotHeight, svgHeight]);

  // Smooth Bezier Curve Path for Inflows
  const inflowCurvePath = useMemo(() => {
    if (chartPoints.length < 2) return "";
    let path = `M ${chartPoints[0].x} ${chartPoints[0].incomeY}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const curr = chartPoints[i];
      const next = chartPoints[i + 1];
      const cpX = (curr.x + next.x) / 2;
      path += ` C ${cpX} ${curr.incomeY}, ${cpX} ${next.incomeY}, ${next.x} ${next.incomeY}`;
    }
    return path;
  }, [chartPoints]);

  // Area fill under inflow curve
  const inflowAreaPath = useMemo(() => {
    if (!inflowCurvePath || chartPoints.length < 2) return "";
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const baseline = svgHeight - paddingY;
    return `${inflowCurvePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [inflowCurvePath, chartPoints, svgHeight]);

  // Donut chart arcs
  const donutArcs = useMemo(() => {
    let currentAngle = 0;
    return categoryData.map((cat) => {
      const sliceAngle = (cat.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle += sliceAngle;

      const path = describeDonutArc(110, 110, 95, 62, startAngle, endAngle);
      return {
        ...cat,
        startAngle,
        endAngle,
        path,
      };
    });
  }, [categoryData]);

  const activeCategory = hoveredCategory
    ? categoryData.find((c) => c.category === hoveredCategory)
    : null;

  return (
    <div className="analytics-grid">
      {/* Cashflow Trends Card with Time Horizon Selector */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title-row">
              <h3>Cashflow & Net Trajectory</h3>
              <span className="live-spark-pill">Live Curve</span>
            </div>
            <p className="chart-subtitle">Smooth gradient flow of monthly inflows & outflows</p>
          </div>

          <div className="chart-controls">
            {/* Time Horizon Toggles */}
            <div className="horizon-toggle-group">
              {["7D", "30D", "3M", "ALL"].map((horizon) => (
                <button
                  key={horizon}
                  type="button"
                  className={`horizon-btn ${timeHorizon === horizon ? "active" : ""}`}
                  onClick={() => setTimeHorizon(horizon)}
                >
                  {horizon}
                </button>
              ))}
            </div>

            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot dot-emerald"></span> Inflow
              </span>
              <span className="legend-item">
                <span className="legend-dot dot-rose"></span> Outflow
              </span>
            </div>
          </div>
        </div>

        {cashflowData.length === 0 ? (
          <div className="chart-empty">No transaction history in this period.</div>
        ) : (
          <div className="cashflow-chart-container">
            <svg
              className="cashflow-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Emerald Inflow Area Gradient */}
                <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                {/* Glow Filter */}
                <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = svgHeight - paddingY - (plotHeight * ratio);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="var(--border-subtle)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Baseline axis */}
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY}
                stroke="var(--border-subtle)"
                strokeWidth="1.5"
              />

              {/* Inflow Area gradient fill */}
              {inflowAreaPath && (
                <path d={inflowAreaPath} fill="url(#emeraldAreaGrad)" />
              )}

              {/* Smooth Inflow Curve Line */}
              {inflowCurvePath && (
                <path
                  d={inflowCurvePath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  filter="url(#curveGlow)"
                />
              )}

              {/* Outflow column bars for comparison */}
              {chartPoints.map((pt, idx) => {
                const isHovered = hoveredPoint === idx;
                return (
                  <g
                    key={pt.key}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Outflow Bar */}
                    <rect
                      x={pt.x - 14}
                      y={pt.expenseY}
                      width="12"
                      height={Math.max(4, pt.expenseH)}
                      rx="3"
                      fill="#f43f5e"
                      opacity={isHovered ? 1 : 0.75}
                    />

                    {/* Inflow Marker Dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.incomeY}
                      r={isHovered ? 6 : 4}
                      fill="#10b981"
                      stroke="var(--bg-card)"
                      strokeWidth="2"
                    />

                    {/* Month Label */}
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="var(--text-secondary)"
                      className="chart-axis-text"
                    >
                      {pt.label}
                    </text>

                    {/* Interactive Crosshair & Tooltip */}
                    {isHovered && (
                      <g>
                        <line
                          x1={pt.x}
                          y1={paddingY}
                          x2={pt.x}
                          y2={svgHeight - paddingY}
                          stroke="#38bdf8"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip display */}
            {hoveredPoint !== null && chartPoints[hoveredPoint] && (
              <div
                className="chart-floating-tooltip animate-fade-in"
                style={{
                  left: `${(chartPoints[hoveredPoint].x / svgWidth) * 100}%`,
                  top: "15px",
                }}
              >
                <div className="tooltip-period">{chartPoints[hoveredPoint].label}</div>
                <div className="tooltip-row text-emerald">
                  <span>Inflow:</span>
                  <strong className="num-mono">+{formatCurrency(chartPoints[hoveredPoint].income, currentCurrency)}</strong>
                </div>
                <div className="tooltip-row text-rose">
                  <span>Outflow:</span>
                  <strong className="num-mono">-{formatCurrency(chartPoints[hoveredPoint].expense, currentCurrency)}</strong>
                </div>
                <div className="tooltip-row tooltip-net">
                  <span>Net:</span>
                  <strong className="num-mono">
                    {formatCurrency(chartPoints[hoveredPoint].income - chartPoints[hoveredPoint].expense, currentCurrency)}
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Donut Breakdown Card */}
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3>Spending Distribution</h3>
            <p className="chart-subtitle">Interactive category allocation</p>
          </div>
          <span className="donut-total-badge num-mono">
            {formatCurrency(totalExpenseFiltered, currentCurrency)}
          </span>
        </div>

        {categoryData.length === 0 ? (
          <div className="chart-empty">No expense breakdown recorded.</div>
        ) : (
          <div className="donut-chart-layout">
            {/* SVG Donut Circle */}
            <div className="donut-svg-wrapper">
              <svg width="220" height="220" viewBox="0 0 220 220" className="donut-svg">
                {donutArcs.map((arc) => {
                  const isHovered = hoveredCategory === arc.category;
                  return (
                    <path
                      key={arc.category}
                      d={arc.path}
                      fill={arc.color}
                      opacity={hoveredCategory ? (isHovered ? 1 : 0.45) : 0.9}
                      stroke="var(--bg-card)"
                      strokeWidth="2"
                      className="donut-slice"
                      onMouseEnter={() => setHoveredCategory(arc.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{
                        transformOrigin: "110px 110px",
                        transform: isHovered ? "scale(1.04)" : "scale(1)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Hole Content */}
              <div className="donut-center-info">
                {activeCategory ? (
                  <div className="donut-active-preview animate-fade-in">
                    <span className="donut-active-icon">{activeCategory.icon}</span>
                    <span className="donut-active-name">{activeCategory.category}</span>
                    <span className="donut-active-pct num-mono">{activeCategory.percentage}%</span>
                  </div>
                ) : (
                  <div className="donut-default-preview">
                    <span className="donut-center-label">Total Spent</span>
                    <span className="donut-center-val num-mono">{formatCurrency(totalExpenseFiltered, currentCurrency)}</span>
                    <span className="donut-center-count">{categoryData.length} categories</span>
                  </div>
                )}
              </div>
            </div>

            {/* Category Legend & Bars */}
            <div className="category-legend-list">
              {categoryData.slice(0, 5).map((cat) => {
                const isHovered = hoveredCategory === cat.category;
                return (
                  <div
                    key={cat.category}
                    className={`legend-cat-row ${isHovered ? "active" : ""}`}
                    onMouseEnter={() => setHoveredCategory(cat.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="legend-cat-info">
                      <span className="legend-cat-avatar" style={{ backgroundColor: `${cat.color}25`, color: cat.color }}>
                        {cat.icon}
                      </span>
                      <span className="legend-cat-name">{cat.category}</span>
                    </div>

                    <div className="legend-cat-nums">
                      <span className="legend-cat-pct num-mono">{cat.percentage}%</span>
                      <span className="legend-cat-amt num-mono">{formatCurrency(cat.amount, currentCurrency)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsCharts;
