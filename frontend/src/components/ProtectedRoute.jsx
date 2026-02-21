import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { apiGet } from '../api/client.js'
import '../css/shared.css'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [state, setState] = useState({ loading: true, authed: false })

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        await apiGet('/dashboard/')
        if (mounted) setState({ loading: false, authed: true })
      } catch {
        if (mounted) setState({ loading: false, authed: false })
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (state.loading) {
    return (
      <div className="centerWrap">
        <div className="spinner" aria-label="Loading" />
      </div>
    )
  }

  if (!state.authed) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
