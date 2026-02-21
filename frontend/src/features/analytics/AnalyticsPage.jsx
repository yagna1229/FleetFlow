/**
 * AnalyticsPage — "Big Picture" Dashboard
 * Features custom SVG charts and financial reports in the white theme.
 */
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDashboardAggregate } from '../../store/slices/analyticsSlice'
import LoadingSpinner from '../../components/LoadingSpinner'
import '../../css/analytics.css'
import '../../css/shared.css'

// ── Custom SVG Line & Scatterplot Chart ──
function FuelEfficiencyChart({ data }) {
    const [tooltip, setTooltip] = useState(null)
    const [hoverIdx, setHoverIdx] = useState(null)
    const [hoverLine, setHoverLine] = useState(null)
    const width = 450
    const height = 250
    const padX = 40
    const padY = 30
    const plotW = width - padX * 2
    const plotH = height - padY * 2

    if (!data || data.length === 0) return <div>No data available</div>

    // Scales
    const getX = (i) => padX + (i * plotW) / (data.length - 1 || 1)
    const maxVal = Math.max(...data.map(d => Math.max(d.val1, d.val2, 100)))
    const stepY = Math.ceil(maxVal / 4 / 25) * 25 // Auto-scale ticks
    const yTicks = [0, stepY, stepY * 2, stepY * 3, stepY * 4]
    const getY = (val) => height - padY - (val / (stepY * 4)) * plotH

    const path1 = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.val1)}`).join(' ')
    const path2 = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.val2)}`).join(' ')

    const handleHover = (e, val, label) => {
        const rect = e.target.getBoundingClientRect()
        setTooltip({ x: rect.left + rect.width / 2, y: rect.top, val, label })
    }

    const unHover = () => {
        setTooltip(null)
        setHoverIdx(null)
        setHoverLine(null)
    }

    return (
        <div className="analyticsChartCard" style={{ position: 'relative' }}>
            <h3 className="analyticsChartTitle">Fuel Efficiency Trend (kmL)</h3>
            <svg viewBox={`0 0 ${width} ${height}`} className="svgChart">
                {/* Y-axis lines */}
                {yTicks.map(tick => (
                    <g key={`y-${tick}`}>
                        <text x={padX - 10} y={getY(tick) + 4} textAnchor="end" className="svgAxisText">{tick}</text>
                        <line x1={padX} y1={getY(tick)} x2={width - padX} y2={getY(tick)} className="svgGridLine" />
                    </g>
                ))}

                {/* X-axis texts */}
                {data.map((d, i) => (
                    <text key={`x-${i}`} x={getX(i)} y={height - 10} textAnchor="middle" className="svgAxisText">{d.month}</text>
                ))}

                {/* Axes */}
                <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} className="svgAxisLine" />
                <line x1={padX} y1={padY} x2={padX} y2={height - padY} className="svgAxisLine" />

                {/* Connecting Lines (Scatterplot style) */}
                <path d={path1} className="svgLinePath" style={{ fill: 'none', stroke: 'var(--brand, #06b6d4)', strokeDasharray: '4 4' }} />
                <path d={path2} className="svgLinePath" style={{ fill: 'none', stroke: 'var(--accent-500, #f97316)', strokeDasharray: '4 4' }} />

                {/* Scatter Dots */}
                {data.map((d, i) => (
                    <g key={`n1-${i}`}>
                        <circle cx={getX(i)} cy={getY(d.val1)} r={hoverIdx === i && hoverLine === 'A' ? 7 : 5}
                            style={{
                                fill: hoverIdx === i && hoverLine === 'A' ? 'var(--secondary-600, #0891b2)' : 'var(--brand, #06b6d4)',
                                stroke: 'var(--brand, #06b6d4)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { handleHover(e, d.val1, 'Vehicle A'); setHoverIdx(i); setHoverLine('A'); }} onMouseLeave={unHover} />
                        <circle cx={getX(i)} cy={getY(d.val2)} r={hoverIdx === i && hoverLine === 'B' ? 7 : 5}
                            style={{
                                fill: hoverIdx === i && hoverLine === 'B' ? 'var(--accent-600, #ea580c)' : 'var(--accent-500, #f97316)',
                                stroke: 'var(--accent-500, #f97316)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { handleHover(e, d.val2, 'Vehicle B'); setHoverIdx(i); setHoverLine('B'); }} onMouseLeave={unHover} />
                    </g>
                ))}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div className="chartTooltip" style={{ left: tooltip.x, top: tooltip.y, position: 'fixed' }}>
                    {tooltip.label}: {tooltip.val}
                </div>
            )}
        </div>
    )
}

// ── Custom SVG Bar Chart ──
function CostliestVehiclesChart({ data }) {
    const [tooltip, setTooltip] = useState(null)
    const [hoverIdx, setHoverIdx] = useState(null)
    const baseWidth = 450
    const height = 250
    const padX = 50
    const padY = 30
    const barWidth = 30
    const barSpacing = 75

    if (!data || data.length === 0) return <div>No data available</div>

    const itemsWidth = data.length * barSpacing;
    const width = Math.max(baseWidth, itemsWidth + padX * 2)
    const startX = width > baseWidth ? padX : (baseWidth - itemsWidth) / 2;
    const plotH = height - padY * 2

    const getX = (i) => startX + i * barSpacing + (barSpacing - barWidth) / 2
    const getY = (val) => height - padY - (val / 100) * plotH

    const handleHover = (e, name, actual_cost) => {
        const rect = e.target.getBoundingClientRect()
        setTooltip({ x: rect.left + rect.width / 2, y: rect.top, name, actual_cost })
    }

    return (
        <div className="analyticsChartCard" style={{ position: 'relative', overflow: 'hidden' }}>
            <h3 className="analyticsChartTitle">Top Costliest Vehicles</h3>
            <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '10px' }}>
                <svg viewBox={`0 0 ${width} ${height}`} className="svgChart" style={{ minWidth: `${width}px` }}>
                    {/* Y-axis lines */}
                    {[0, 25, 50, 75, 100].map(tick => (
                        <g key={`y-${tick}`}>
                            <text x={padX - 10} y={getY(tick) + 4} textAnchor="end" className="svgAxisText">{tick}</text>
                            <line x1={padX} y1={getY(tick)} x2={width - padX} y2={getY(tick)} className="svgGridLine" />
                        </g>
                    ))}

                    {/* Axes */}
                    <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} className="svgAxisLine" />
                    <line x1={padX} y1={padY} x2={padX} y2={height - padY} className="svgAxisLine" />

                    {/* Bars */}
                    {data.map((d, i) => {
                        const barH = plotH * (d.cost / 100)
                        return (
                            <g key={`b-${i}`}>
                                <rect
                                    x={getX(i)} y={getY(d.cost)} width={barWidth} height={barH}
                                    rx={4}
                                    style={{
                                        fill: hoverIdx === i ? 'var(--primary-200, #bae6fd)' : 'var(--primary-100, #cffafe)',
                                        stroke: hoverIdx === i ? 'var(--secondary-500, #0ea5e9)' : 'var(--brand, #06b6d4)',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { handleHover(e, d.name, d.actual_cost); setHoverIdx(i); }}
                                    onMouseLeave={() => { setTooltip(null); setHoverIdx(null); }}
                                />
                                <text x={getX(i) + barWidth / 2} y={height - 10} textAnchor="middle" className="svgAxisText">
                                    {d.label}
                                </text>
                            </g>
                        )
                    })}
                </svg>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div className="chartTooltip" style={{ left: tooltip.x, top: tooltip.y, position: 'fixed' }}>
                    {tooltip.name}: {tooltip.actual_cost}
                </div>
            )}
        </div>
    )
}

export default function AnalyticsPage() {
    const dispatch = useDispatch()
    const { aggregate, status } = useSelector((s) => s.analytics)

    useEffect(() => {
        dispatch(fetchDashboardAggregate())
    }, [dispatch])

    if (status === 'loading' && !aggregate) return <LoadingSpinner />
    if (!aggregate) return <div>No analytics data available.</div>

    return (
        <div className="analyticsWrap">
            {/* ── Top KPIs ── */}
            <div className="analyticsTopKPIs">
                <div className="analyticsKpiCard" style={{ borderColor: 'var(--secondary-300)' }}>
                    <div className="analyticsKpiLabel" style={{ color: 'var(--secondary-600)' }}>Total Fuel Cost</div>
                    <div className="analyticsKpiValue">{aggregate.fuelCost}</div>
                </div>
                <div className="analyticsKpiCard" style={{ borderColor: 'var(--accent-300)' }}>
                    <div className="analyticsKpiLabel" style={{ color: 'var(--accent-600)' }}>Fleet ROI</div>
                    <div className={`analyticsKpiValue ${aggregate.roi.startsWith('+') ? 'positive' : ''}`}>{aggregate.roi}</div>
                </div>
                <div className="analyticsKpiCard" style={{ borderColor: 'var(--primary-300)' }}>
                    <div className="analyticsKpiLabel" style={{ color: 'var(--primary-600)' }}>Utilization Rate</div>
                    <div className="analyticsKpiValue" style={{ color: 'var(--primary-700)' }}>{aggregate.utilization}</div>
                </div>
            </div>

            {/* ── Charts ── */}
            <div className="analyticsChartsRow">
                <FuelEfficiencyChart data={aggregate.efficiency_data} />
                <CostliestVehiclesChart data={aggregate.costliest_data} />
            </div>

            {/* ── Financial Summary Table ── */}
            <div className="analyticsTableSection">
                <div className="analyticsTableTitle">Financial Summary of Month</div>
                <table className="analyticsTable">
                    <thead>
                        <tr>
                            <th style={{ color: 'var(--primary-600)' }}>Month</th>
                            <th>Revenue</th>
                            <th>Fuel Cost</th>
                            <th style={{ color: 'var(--secondary-600)' }}>Maintenance</th>
                            <th style={{ color: '#10b981' }}>Net Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {aggregate.financial_data.map((row, i) => (
                            <tr key={i}>
                                <td>{row.month}</td>
                                <td>{row.revenue === '-' ? <span style={{ color: 'var(--text-muted)' }}>-</span> : row.revenue}</td>
                                <td>{row.fuel === '-' ? <span style={{ color: 'var(--text-muted)' }}>-</span> : row.fuel}</td>
                                <td>{row.maint === '-' ? <span style={{ color: 'var(--text-muted)' }}>-</span> : row.maint}</td>
                                <td style={{ fontWeight: 600 }}>{row.profit === '-' ? <span style={{ color: 'var(--text-muted)' }}>-</span> : row.profit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
