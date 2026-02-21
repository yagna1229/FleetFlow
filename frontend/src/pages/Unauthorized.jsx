/**
 * Unauthorized — shown when user doesn't have permission to access a route.
 */
import { useNavigate } from 'react-router-dom'
import '../css/shared.css'

export default function Unauthorized() {
    const navigate = useNavigate()

    return (
        <div className="authPage">
            <div className="authCard" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h1 className="authTitle">Access Denied</h1>
                <p className="authSubTitle" style={{ marginBottom: 24 }}>
                    You don't have permission to access this page.
                    <br />
                    Contact your administrator to request access.
                </p>
                <button className="primaryBtn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    )
}
