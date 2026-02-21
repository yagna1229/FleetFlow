/**
 * ProtectedRoute — checks auth via Redux + role-based access.
 * Redirects to /login if not authenticated, /unauthorized if role not allowed.
 */
import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { checkAuth } from '../store/slices/authSlice'
import { canAccess } from '../constants/roles'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()
  const dispatch = useDispatch()
  const { isAuthenticated, role, status } = useSelector((state) => state.auth)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(checkAuth())
    }
  }, [dispatch, status])

  if (status === 'idle' || status === 'loading') {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // If allowedRoles specified, check against them
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Also check via canAccess for path-based role protection
  if (role && !canAccess(role, location.pathname)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
