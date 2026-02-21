/**
 * Command Center — Role-based Dashboard.
 * Shows different widgets based on user role.
 */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchDashboardKPIs } from '../store/slices/analyticsSlice'
import { fetchTrips } from '../store/slices/tripSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusPill from '../components/StatusPill'
import { ROUTES } from '../constants/routes'
import { ROLES, ROLE_META, canAccess } from '../constants/roles'
import { formatNumber } from '../utils/formatters'
import '../css/dashboard.css'
import '../css/shared.css'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { dashboard, status } = useSelector((s) => s.analytics)
  const { items: recentTrips } = useSelector((s) => s.trips)
  const role = useSelector((s) => s.auth.role)

  useEffect(() => {
    dispatch(fetchDashboardKPIs())
    dispatch(fetchTrips({ per_page: 5 }))
  }, [dispatch])

  if (status === 'loading' && !dashboard) return <LoadingSpinner />

  const kpis = dashboard || {
    active_fleet: 0,
    in_maintenance: 0,
    utilization_rate: 0,
    pending_cargo: 0,
    total_vehicles: 0,
    available_vehicles: 0,
    retired_vehicles: 0,
  }

  const roleMeta = ROLE_META[role] || ROLE_META[ROLES.MANAGER]

  return (
    <div className="dashWrap">
      {/* ── Header ── */}
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Command Center</h1>
          <p className="pageSubtitle">
            {roleMeta.icon} Logged in as <strong>{roleMeta.label}</strong> — {roleMeta.description}
          </p>
        </div>
      </div>

      {/* ── KPI Cards — role-aware ── */}
      <div className="kpiGrid">
        {/* All roles see Active Fleet */}
        <div className="kpiCard kpiBrand" onClick={() => canAccess(role, '/vehicles') && navigate(ROUTES.VEHICLES)} style={{ cursor: canAccess(role, '/vehicles') ? 'pointer' : 'default' }}>
          <div className="kpiIcon">🚛</div>
          <div className="kpiLabel">Active Fleet</div>
          <div className="kpiValue">{kpis.active_fleet}</div>
          <div className="kpiSub">vehicles on trip</div>
        </div>

        {/* Manager + Safety Officer: maintenance alerts */}
        {(role === ROLES.MANAGER || role === ROLES.SAFETY_OFFICER) && (
          <div className="kpiCard kpiWarning" onClick={() => canAccess(role, '/maintenance') && navigate(ROUTES.MAINTENANCE)} style={{ cursor: canAccess(role, '/maintenance') ? 'pointer' : 'default' }}>
            <div className="kpiIcon">🔧</div>
            <div className="kpiLabel">Maintenance Alerts</div>
            <div className="kpiValue">{kpis.in_maintenance}</div>
            <div className="kpiSub">vehicles in shop</div>
          </div>
        )}

        {/* Manager + Financial Analyst: utilization */}
        {(role === ROLES.MANAGER || role === ROLES.FINANCIAL_ANALYST) && (
          <div className="kpiCard kpiSuccess">
            <div className="kpiIcon">📊</div>
            <div className="kpiLabel">Utilization Rate</div>
            <div className="kpiValue">{formatNumber(kpis.utilization_rate, 1)}%</div>
            <div className="kpiSub">of fleet assigned</div>
          </div>
        )}

        {/* Manager + Dispatcher: pending cargo */}
        {(role === ROLES.MANAGER || role === ROLES.DISPATCHER) && (
          <div className="kpiCard kpiInfo" onClick={() => navigate(ROUTES.TRIPS)} style={{ cursor: 'pointer' }}>
            <div className="kpiIcon">📦</div>
            <div className="kpiLabel">Pending Cargo</div>
            <div className="kpiValue">{kpis.pending_cargo}</div>
            <div className="kpiSub">draft shipments</div>
          </div>
        )}
      </div>

      {/* ── Fleet Status — Manager, Dispatcher, Safety Officer ── */}
      {(role === ROLES.MANAGER || role === ROLES.DISPATCHER || role === ROLES.SAFETY_OFFICER) && (
        <div className="dashSection">
          <h3 className="dashSectionTitle">Fleet Status Breakdown</h3>
          <div className="quickStats">
            <div className="quickStat">
              <div className="quickStatDot" style={{ background: '#34d399' }} />
              <span className="quickStatLabel">Available</span>
              <span className="quickStatValue">{kpis.available_vehicles}</span>
            </div>
            <div className="quickStat">
              <div className="quickStatDot" style={{ background: '#93b4ff' }} />
              <span className="quickStatLabel">On Trip</span>
              <span className="quickStatValue">{kpis.active_fleet}</span>
            </div>
            <div className="quickStat">
              <div className="quickStatDot" style={{ background: '#fbbf24' }} />
              <span className="quickStatLabel">In Shop</span>
              <span className="quickStatValue">{kpis.in_maintenance}</span>
            </div>
            <div className="quickStat">
              <div className="quickStatDot" style={{ background: '#9ca3af' }} />
              <span className="quickStatLabel">Retired</span>
              <span className="quickStatValue">{kpis.retired_vehicles}</span>
            </div>
            <div className="quickStat">
              <div className="quickStatDot" style={{ background: 'var(--brand2)' }} />
              <span className="quickStatLabel">Total Fleet</span>
              <span className="quickStatValue">{kpis.total_vehicles}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Trips — All roles can see ── */}
      <div className="dashSection">
        <h3 className="dashSectionTitle">Recent Trips</h3>
        {recentTrips.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No trips yet.</p>
        ) : (
          <table className="dtTable" style={{ borderRadius: '10px', overflow: 'hidden' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Origin → Destination</th>
                <th>Cargo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.slice(0, 5).map((trip) => (
                <tr
                  key={trip.id}
                  className="dtClickable"
                  onClick={() => navigate(`${ROUTES.TRIPS}/${trip.id}`)}
                >
                  <td>#{trip.id}</td>
                  <td>{trip.origin} → {trip.destination}</td>
                  <td>{formatNumber(trip.cargo_weight_kg)} kg</td>
                  <td><StatusPill status={trip.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Quick Actions — role-aware ── */}
      <div className="dashSection">
        <h3 className="dashSectionTitle">Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {canAccess(role, '/vehicles/new') && (
            <button className="primaryBtn" onClick={() => navigate(ROUTES.VEHICLE_NEW)}>+ Add Vehicle</button>
          )}
          {canAccess(role, '/drivers/new') && (
            <button className="primaryBtn" onClick={() => navigate(ROUTES.DRIVER_NEW)}>+ Add Driver</button>
          )}
          {canAccess(role, '/trips/new') && (
            <button className="primaryBtn" onClick={() => navigate(ROUTES.TRIP_NEW)}>+ Create Trip</button>
          )}
          {canAccess(role, '/analytics') && (
            <button className="secondaryBtn" onClick={() => navigate(ROUTES.ANALYTICS)}>View Analytics</button>
          )}
          {canAccess(role, '/expenses') && (
            <button className="secondaryBtn" onClick={() => navigate(ROUTES.EXPENSES)}>View Expenses</button>
          )}
        </div>
      </div>
    </div>
  )
}
