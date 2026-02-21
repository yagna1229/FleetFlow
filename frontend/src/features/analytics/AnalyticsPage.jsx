/**
 * AnalyticsPage — dashboard KPIs, vehicle cost lookup, fuel efficiency.
 */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardKPIs, fetchVehicleCosts, fetchFuelEfficiency } from '../../store/slices/analyticsSlice'
import { fetchVehicles } from '../../store/slices/vehicleSlice'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatNumber, formatCurrency } from '../../utils/formatters'
import '../../css/dashboard.css'
import '../../css/shared.css'

export default function AnalyticsPage() {
    const dispatch = useDispatch()
    const { dashboard, vehicleCosts, fuelEfficiency, status } = useSelector((s) => s.analytics)
    const { items: vehicles } = useSelector((s) => s.vehicles)
    const [selectedVehicle, setSelectedVehicle] = useState('')

    useEffect(() => {
        dispatch(fetchDashboardKPIs())
        dispatch(fetchVehicles())
    }, [dispatch])

    const handleVehicleSelect = (e) => {
        const vid = e.target.value
        setSelectedVehicle(vid)
        if (vid) {
            dispatch(fetchVehicleCosts(parseInt(vid)))
            dispatch(fetchFuelEfficiency(parseInt(vid)))
        }
    }

    if (status === 'loading' && !dashboard) return <LoadingSpinner />

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Analytics & Reports</h1>
                    <p className="pageSubtitle">Data-driven fleet insights and financial metrics</p>
                </div>
            </div>

            {/* ── Fleet overview KPIs ── */}
            {dashboard && (
                <div className="kpiGrid">
                    <div className="kpiCard kpiBrand">
                        <div className="kpiIcon">🚛</div>
                        <div className="kpiLabel">Total Fleet</div>
                        <div className="kpiValue">{dashboard.total_vehicles}</div>
                    </div>
                    <div className="kpiCard kpiSuccess">
                        <div className="kpiIcon">📊</div>
                        <div className="kpiLabel">Utilization</div>
                        <div className="kpiValue">{formatNumber(dashboard.utilization_rate, 1)}%</div>
                    </div>
                    <div className="kpiCard kpiWarning">
                        <div className="kpiIcon">🔧</div>
                        <div className="kpiLabel">In Maintenance</div>
                        <div className="kpiValue">{dashboard.in_maintenance}</div>
                    </div>
                    <div className="kpiCard kpiInfo">
                        <div className="kpiIcon">📦</div>
                        <div className="kpiLabel">Pending Cargo</div>
                        <div className="kpiValue">{dashboard.pending_cargo}</div>
                    </div>
                </div>
            )}

            {/* ── Vehicle cost lookup ── */}
            <div className="dashSection">
                <h3 className="dashSectionTitle">Vehicle Cost Analysis</h3>
                <div className="formGroup" style={{ maxWidth: 400 }}>
                    <label className="formLabel">Select a vehicle to view cost breakdown</label>
                    <select className="formSelect" value={selectedVehicle} onChange={handleVehicleSelect}>
                        <option value="">Choose vehicle...</option>
                        {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>{v.name} — {v.license_plate}</option>
                        ))}
                    </select>
                </div>

                {vehicleCosts && selectedVehicle && (
                    <div className="kpiGrid" style={{ marginTop: 16 }}>
                        <div className="kpiCard kpiBrand">
                            <div className="kpiLabel">Total Fuel Cost</div>
                            <div className="kpiValue">{formatCurrency(vehicleCosts.total_fuel_cost)}</div>
                        </div>
                        <div className="kpiCard kpiWarning">
                            <div className="kpiLabel">Total Maintenance</div>
                            <div className="kpiValue">{formatCurrency(vehicleCosts.total_maintenance_cost)}</div>
                        </div>
                        <div className="kpiCard kpiInfo">
                            <div className="kpiLabel">Total Expenses</div>
                            <div className="kpiValue">{formatCurrency(vehicleCosts.total_expense_cost)}</div>
                        </div>
                        <div className="kpiCard kpiSuccess">
                            <div className="kpiLabel">Total Operational Cost</div>
                            <div className="kpiValue">{formatCurrency(vehicleCosts.total_operational_cost)}</div>
                        </div>
                        <div className="kpiCard kpiBrand">
                            <div className="kpiLabel">Cost per KM</div>
                            <div className="kpiValue">{vehicleCosts.cost_per_km ? `₹${formatNumber(vehicleCosts.cost_per_km, 2)}` : '—'}</div>
                        </div>
                        <div className="kpiCard kpiSuccess">
                            <div className="kpiLabel">Vehicle ROI</div>
                            <div className="kpiValue">{vehicleCosts.vehicle_roi ? `${formatNumber(vehicleCosts.vehicle_roi * 100, 2)}%` : '—'}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Fuel efficiency ── */}
            {fuelEfficiency && selectedVehicle && (
                <div className="dashSection">
                    <h3 className="dashSectionTitle">Fuel Efficiency — {fuelEfficiency.license_plate}</h3>
                    <div className="kpiGrid">
                        <div className="kpiCard kpiBrand">
                            <div className="kpiLabel">Total KM</div>
                            <div className="kpiValue">{formatNumber(fuelEfficiency.total_km)} km</div>
                        </div>
                        <div className="kpiCard kpiWarning">
                            <div className="kpiLabel">Total Fuel</div>
                            <div className="kpiValue">{formatNumber(fuelEfficiency.total_liters)} L</div>
                        </div>
                        <div className="kpiCard kpiSuccess">
                            <div className="kpiLabel">Efficiency (km/L)</div>
                            <div className="kpiValue">{fuelEfficiency.km_per_liter ? formatNumber(fuelEfficiency.km_per_liter, 2) : '—'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
