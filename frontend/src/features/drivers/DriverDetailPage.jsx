/**
 * DriverDetailPage — driver profile with safety score and trip stats.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { apiGet } from '../../api/client'
import StatusPill from '../../components/StatusPill'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ROUTES } from '../../constants/routes'
import { formatDate, formatDateTime } from '../../utils/formatters'
import '../../css/drivers.css'
import '../../css/shared.css'

export default function DriverDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        ; (async () => {
            try {
                const data = await apiGet(`/api/v1/drivers/${id}`)
                setDriver(data)
            } catch {
                toast.error('Driver not found')
                navigate(ROUTES.DRIVERS)
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    if (loading) return <LoadingSpinner />
    if (!driver) return null

    const isExpired = new Date(driver.license_expiry) <= new Date()
    const safetyColor = driver.safety_score >= 80 ? '#34d399' : driver.safety_score >= 50 ? '#fbbf24' : '#f87171'
    const completionRate = driver.total_trips > 0
        ? ((driver.completed_trips / driver.total_trips) * 100).toFixed(1)
        : '0.0'

    return (
        <div className="driverWrap">
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">{driver.full_name}</h1>
                    <p className="pageSubtitle">{driver.email}</p>
                </div>
                <button className="secondaryBtn" onClick={() => navigate(ROUTES.DRIVERS)}>← Back</button>
            </div>

            {isExpired && (
                <div className="licenseAlert">
                    ⚠️ License expired on {formatDate(driver.license_expiry)} — this driver cannot be assigned to trips.
                </div>
            )}

            <div className="driverProfileGrid">
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Status</div>
                    <div className="driverProfileValue"><StatusPill status={driver.status} /></div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">License #</div>
                    <div className="driverProfileValue"><code>{driver.license_number}</code></div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Category</div>
                    <div className="driverProfileValue">{driver.license_category}</div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">License Expiry</div>
                    <div className="driverProfileValue" style={isExpired ? { color: '#f87171' } : {}}>
                        {formatDate(driver.license_expiry)}
                    </div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Safety Score</div>
                    <div className="driverProfileValue">
                        <div className="safetyScore" style={{ color: safetyColor }}>
                            {driver.safety_score}%
                        </div>
                        <div className="safetyBar">
                            <div className="safetyBarFill" style={{ width: `${driver.safety_score}%`, background: safetyColor }} />
                        </div>
                    </div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Total Trips</div>
                    <div className="driverProfileValue">{driver.total_trips}</div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Completed Trips</div>
                    <div className="driverProfileValue">{driver.completed_trips}</div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Completion Rate</div>
                    <div className="driverProfileValue">{completionRate}%</div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Phone</div>
                    <div className="driverProfileValue">{driver.phone || '—'}</div>
                </div>
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Added On</div>
                    <div className="driverProfileValue">{formatDateTime(driver.created_at)}</div>
                </div>
            </div>
        </div>
    )
}
