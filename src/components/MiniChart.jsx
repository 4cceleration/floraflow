import React, { useMemo } from 'react';

// ── Helpers ───────────────────────────────────────────────────
function normalize(values) {
    const max = Math.max(...values, 1);
    return values.map(v => (v / max) * 100);
}

// ── BAR CHART ─────────────────────────────────────────────────
function BarChart({ values, labels, color, unit }) {
    const norm = normalize(values);
    const barW = Math.max(8, Math.min(28, (240 / values.length) - 4));

    return (
        <svg viewBox={`0 0 ${values.length * (barW + 4)} 80`} className="mini-chart-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id={`bg-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.2" />
                </linearGradient>
            </defs>
            {norm.map((h, i) => {
                const barH = Math.max(3, (h / 100) * 60);
                const x = i * (barW + 4);
                return (
                    <g key={i}>
                        <rect x={x} y={80 - barH - 18} width={barW} height={barH}
                            rx={3} fill={`url(#bg-${color})`}
                            style={{ filter: `drop-shadow(0 0 4px ${color}55)` }}
                        />
                        {labels?.[i] && (
                            <text x={x + barW / 2} y={78} textAnchor="middle"
                                fontSize="7" fill="rgba(255,255,255,0.45)">
                                {labels[i]}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ── SPARKLINE (LINE + AREA) ───────────────────────────────────
function LineChart({ values, labels, color }) {
    const norm = normalize(values);
    const W = 240, H = 64;
    const step = W / (norm.length - 1 || 1);

    const points = norm.map((v, i) => [i * step, H - 8 - (v / 100) * (H - 16)]);
    const polyline = points.map(([x, y]) => `${x},${y}`).join(' ');

    // Smooth path using cubic bezier
    const pathD = points.reduce((acc, [x, y], i) => {
        if (i === 0) return `M${x},${y}`;
        const [px, py] = points[i - 1];
        const cx = (px + x) / 2;
        return acc + ` C${cx},${py} ${cx},${y} ${x},${y}`;
    }, '');

    const areaD = `${pathD} L${W},${H} L0,${H} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="mini-chart-svg" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`area-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#area-${color})`} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
            {points.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill={color}
                    style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                />
            ))}
        </svg>
    );
}

// ── DONUT CHART ───────────────────────────────────────────────
function DonutChart({ values, labels, color }) {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const cx = 42, cy = 42, r = 32, sw = 14;
    const circ = 2 * Math.PI * r;

    const COLORS = [color, '#38bdf8', '#a78bfa', '#f59e0b', '#22d3ee', '#f87171'];
    let offset = 0;
    const slices = values.map((v, i) => {
        const pct = v / total;
        const len = pct * circ;
        const slice = { offset, len, color: COLORS[i % COLORS.length], label: labels?.[i], pct };
        offset += len;
        return slice;
    });

    return (
        <svg viewBox="0 0 120 84" className="mini-chart-svg">
            {/* Track */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
            {slices.map((s, i) => (
                <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                    stroke={s.color} strokeWidth={sw}
                    strokeDasharray={`${s.len} ${circ - s.len}`}
                    strokeDashoffset={-s.offset + circ / 4}
                    style={{ filter: `drop-shadow(0 0 4px ${s.color}88)` }}
                />
            ))}
            {/* Center label */}
            <text x={cx} y={cy - 3} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{values[0]}</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)">{labels?.[0]}</text>
            {/* Legend */}
            {slices.slice(0, 4).map((s, i) => (
                <g key={i} transform={`translate(90, ${12 + i * 16})`}>
                    <circle cx={4} cy={4} r={4} fill={s.color} />
                    <text x={10} y={8} fontSize="7" fill="rgba(255,255,255,0.5)">{s.label} ({Math.round(s.pct * 100)}%)</text>
                </g>
            ))}
        </svg>
    );
}

// ── RADIAL / PROGRESS CHART ───────────────────────────────────
function RadialChart({ values, labels, color }) {
    const val = Math.min(values[0] ?? 0, 100);
    const r = 30, circ = 2 * Math.PI * r;
    const filled = (val / 100) * circ;

    return (
        <svg viewBox="0 0 80 80" className="mini-chart-svg">
            <circle cx={40} cy={40} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={`${filled} ${circ - filled}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
            <text x={40} y={36} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{val}%</text>
            <text x={40} y={52} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.4)"
                style={{ maxWidth: '60px' }}>{labels?.[0] ?? ''}</text>
        </svg>
    );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
const CHART_TYPES = { bar: BarChart, line: LineChart, area: LineChart, donut: DonutChart, radial: RadialChart };
const DEFAULT_COLORS = ['#42f57e', '#38bdf8', '#a78bfa', '#f59e0b', '#22d3ee'];

export default function MiniChart({ chartData, diagramType }) {
    if (!chartData) return null;

    const { type = 'bar', values = [], labels = [], color, unit } = chartData;
    const resolvedColor = color ?? DEFAULT_COLORS[0];
    const ChartComponent = CHART_TYPES[type] ?? BarChart;

    if (values.length === 0) return null;

    return (
        <div className="mini-chart-wrapper">
            {unit && <span className="mini-chart-unit">{unit}</span>}
            <ChartComponent values={values} labels={labels} color={resolvedColor} unit={unit} />
        </div>
    );
}
