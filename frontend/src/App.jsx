/**
 * App root — complete routing with RBAC.
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Unauthorized from './pages/Unauthorized'
import Dashboard from './pages/Dashboard'
import { ROUTES } from './constants/routes'

/* ── Vehicle pages ── */
import VehicleListPage from './features/vehicles/VehicleListPage'
import VehicleFormPage from './features/vehicles/VehicleFormPage'
import VehicleDetailPage from './features/vehicles/VehicleDetailPage'

/* ── Driver pages ── */
import DriverListPage from './features/drivers/DriverListPage'
import DriverFormPage from './features/drivers/DriverFormPage'
import DriverDetailPage from './features/drivers/DriverDetailPage'

/* ── Trip pages ── */
import TripListPage from './features/trips/TripListPage'
import TripFormPage from './features/trips/TripFormPage'
import TripDetailPage from './features/trips/TripDetailPage'

/* ── Other feature pages ── */
import MaintenancePage from './features/maintenance/MaintenancePage'
import ExpensesPage from './features/expenses/ExpensesPage'
import AnalyticsPage from './features/analytics/AnalyticsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ── Public routes ── */}
        <Route index element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── Protected routes (role-based via ProtectedRoute + canAccess) ── */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard — all roles */}
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

          {/* Vehicles — manager, dispatcher (read) */}
          <Route path={ROUTES.VEHICLES} element={<VehicleListPage />} />
          <Route path={ROUTES.VEHICLE_NEW} element={<VehicleFormPage />} />
          <Route path={ROUTES.VEHICLE_DETAIL} element={<VehicleDetailPage />} />

          {/* Drivers — manager, safety_officer, dispatcher (read) */}
          <Route path={ROUTES.DRIVERS} element={<DriverListPage />} />
          <Route path={ROUTES.DRIVER_NEW} element={<DriverFormPage />} />
          <Route path={ROUTES.DRIVER_DETAIL} element={<DriverDetailPage />} />

          {/* Trips — all roles can view */}
          <Route path={ROUTES.TRIPS} element={<TripListPage />} />
          <Route path={ROUTES.TRIP_NEW} element={<TripFormPage />} />
          <Route path={ROUTES.TRIP_DETAIL} element={<TripDetailPage />} />

          {/* Maintenance — manager */}
          <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />

          {/* Expenses — manager, financial_analyst */}
          <Route path={ROUTES.EXPENSES} element={<ExpensesPage />} />

          {/* Analytics — manager, financial_analyst */}
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Route>
    </Routes>
  )
}

export default App
