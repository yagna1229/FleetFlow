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
import { updateDriver } from '../../store/slices/driverSlice'
import { DRIVER_STATUS } from '../../constants/statuses'
import '../../css/drivers.css'
import '../../css/shared.css'

export default function DriverDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()
    const { role } = useSelector((s) => s.auth)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({})

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

    const handleEditClick = () => {
        setEditForm({
            status: driver.status,
            license_expiry: driver.license_expiry.substring(0, 10),
        })
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            await dispatch(updateDriver({ id: driver.id, data: editForm })).unwrap()
            toast.success('Driver updated successfully')
            setIsEditing(false)
            // Re-fetch driver
            const data = await apiGet(`/api/v1/drivers/${id}`)
            setDriver(data)
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Update failed')
        }
    }

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
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondaryBtn" onClick={() => navigate(ROUTES.DRIVERS)}>← Back</button>
                    {(role === 'manager' || role === 'safety_officer') && !isEditing && (
                        <button className="primaryBtn" onClick={handleEditClick}>Edit</button>
                    )}
                </div>
            </div>

            {isExpired && (
                <div className="licenseAlert">
                    ⚠️ License expired on {formatDate(driver.license_expiry)} — this driver cannot be assigned to trips.
                </div>
            )}

            <div className="driverProfileGrid">
                <div className="driverProfileCard">
                    <div className="driverProfileLabel">Status</div>
                    <div className="driverProfileValue">
                        {isEditing ? (
                            <select
                                className="formSelect"
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                {Object.values(DRIVER_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        ) : (
                            <StatusPill status={driver.status} />
                        )}
                    </div>
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
                    <div className="driverProfileValue" style={!isEditing && isExpired ? { color: '#f87171' } : {}}>
                        {isEditing ? (
                            <input
                                className="formInput"
                                type="date"
                                value={editForm.license_expiry}
                                onChange={(e) => setEditForm({ ...editForm, license_expiry: e.target.value })}
                            />
                        ) : (
                            formatDate(driver.license_expiry)
                        )}
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

            {isEditing && (
                <div className="formActions" style={{ marginTop: '20px' }}>
                    <button className="secondaryBtn" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button className="primaryBtn" onClick={handleSave}>Save Changes</button>
                </div>
            )}
        </div>
    )
}
