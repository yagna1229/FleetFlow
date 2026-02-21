/**
 * DriverDetailPage — view + inline-edit a single driver's profile.
 */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { fetchDriver, updateDriver } from '../../store/slices/driverSlice'
import { apiGet } from '../../api/client'
import StatusPill from '../../components/StatusPill'
import { DRIVER_STATUS } from '../../constants/statuses'
import { formatDate } from '../../utils/formatters'
import '../../css/drivers.css'
import '../../css/shared.css'

const LICENSE_CATEGORIES = ['TRUCK', 'VAN', 'BIKE', 'ALL']

export default function DriverDetailPage() {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { role } = useSelector((s) => s.auth)

    const [driver, setDriver] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({})

    const canEdit = role === 'manager' || role === 'safety_officer'

    useEffect(() => {
        loadDriver()
    }, [id])

    async function loadDriver() {
        setLoading(true)
        try {
            const data = await apiGet(`/api/v1/drivers/${id}`)
            setDriver(data)
            setForm({
                full_name: data.full_name || '',
                phone: data.phone || '',
                license_category: data.license_category || '',
                license_expiry: data.license_expiry || '',
                status: data.status || '',
                safety_score: data.safety_score ?? 100,
            })
        } catch (err) {
            toast.error('Failed to load driver')
        } finally {
            setLoading(false)
        }
    }

    function handleChange(e) {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    function handleCancel() {
        setForm({
            full_name: driver.full_name || '',
            phone: driver.phone || '',
            license_category: driver.license_category || '',
            license_expiry: driver.license_expiry || '',
            status: driver.status || '',
            safety_score: driver.safety_score ?? 100,
        })
        setEditing(false)
    }

    async function handleSave() {
        setSaving(true)
        try {
            const result = await dispatch(updateDriver({ id, data: form })).unwrap()
            setDriver(result)
            setEditing(false)
            toast.success('Driver updated successfully')
        } catch (err) {
            toast.error(err || 'Failed to update driver')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="centerWrap">
                <div className="spinner" />
            </div>
        )
    }

    if (!driver) {
        return (
            <div className="centerWrap">
                <p style={{ color: 'var(--text-muted)' }}>Driver not found.</p>
            </div>
        )
    }

    const isExpired = new Date(driver.license_expiry) <= new Date()

    return (
        <div className="driverWrap">
            {/* ── Header ── */}
            <div className="pageHeader">
                <div>
                    <button
                        className="secondaryBtn"
                        onClick={() => navigate('/drivers')}
                        style={{ marginBottom: 12, fontSize: '0.85rem', padding: '6px 14px' }}
                    >
                        ← Back to Drivers
                    </button>
                    <h1 className="pageTitle">{driver.full_name}</h1>
                    <p className="pageSubtitle">
                        Driver #{driver.id} · <StatusPill status={driver.status} />
                    </p>
                </div>
                {canEdit && !editing && (
                    <button className="primaryBtn" onClick={() => setEditing(true)}>
                        ✏️ Edit Driver
                    </button>
                )}
            </div>

            {/* ── Editable form / Read-only view ── */}
            {editing ? (
                <div className="dashSection">
                    <h2 className="dashSectionTitle">Edit Driver Profile</h2>
                    <div className="vehicleForm">
                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">Full Name</label>
                                <input
                                    className="formInput"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">Phone</label>
                                <input
                                    className="formInput"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">License Category</label>
                                <select
                                    className="formSelect"
                                    name="license_category"
                                    value={form.license_category}
                                    onChange={handleChange}
                                >
                                    {LICENSE_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">License Expiry</label>
                                <input
                                    className="formInput"
                                    type="date"
                                    name="license_expiry"
                                    value={form.license_expiry}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="formRow">
                            <div className="formGroup">
                                <label className="formLabel">Status</label>
                                <select
                                    className="formSelect"
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    {Object.values(DRIVER_STATUS).map((s) => (
                                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">Safety Score (%)</label>
                                <input
                                    className="formInput"
                                    type="number"
                                    name="safety_score"
                                    value={form.safety_score}
                                    onChange={handleChange}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>

                        <div className="formActions">
                            <button className="secondaryBtn" onClick={handleCancel} disabled={saving}>
                                Cancel
                            </button>
                            <button className="primaryBtn" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Info Cards ── */}
                    <div className="driverProfileGrid">
                        <div className="driverProfileCard">
                            <div className="driverProfileLabel">Full Name</div>
                            <div className="driverProfileValue">{driver.full_name}</div>
                        </div>
                        <div className="driverProfileCard">
                            <div className="driverProfileLabel">Email</div>
                            <div className="driverProfileValue">{driver.email}</div>
                        </div>
                        <div className="driverProfileCard">
                            <div className="driverProfileLabel">Phone</div>
                            <div className="driverProfileValue">{driver.phone || '—'}</div>
                        </div>
                        <div className="driverProfileCard">
                            <div className="driverProfileLabel">Status</div>
                            <div className="driverProfileValue">
                                <StatusPill status={driver.status} />
                            </div>
                        </div>
                    </div>

                    {/* ── License Details ── */}
                    <div className="dashSection">
                        <h2 className="dashSectionTitle">License Information</h2>
                        <div className="driverProfileGrid">
                            <div className="driverProfileCard">
                                <div className="driverProfileLabel">License Number</div>
                                <div className="driverProfileValue">{driver.license_number}</div>
                            </div>
                            <div className="driverProfileCard">
                                <div className="driverProfileLabel">License Category</div>
                                <div className="driverProfileValue">{driver.license_category}</div>
                            </div>
                            <div className="driverProfileCard">
                                <div className="driverProfileLabel">License Expiry</div>
                                <div className="driverProfileValue" style={isExpired ? { color: '#dc2626' } : {}}>
                                    {formatDate(driver.license_expiry)}
                                    {isExpired && ' ⚠ EXPIRED'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isExpired && (
                        <div className="licenseAlert">
                            ⚠️ This driver's license has expired. Please update the license details or suspend the driver.
                        </div>
                    )}

                    {/* ── Performance & Stats ── */}
                    <div className="dashSection">
                        <h2 className="dashSectionTitle">Performance</h2>
                        <div className="driverProfileGrid">
                            <div className="driverProfileCard">
                                <div className="driverProfileLabel">Safety Score</div>
                                <div className="safetyScore">
                                    {Number(driver.safety_score)}%
                                    <div className="safetyBar">
                                        <div
                                            className="safetyBarFill"
                                            style={{
                                                width: `${driver.safety_score}%`,
                                                background: driver.safety_score >= 80
                                                    ? '#10b981'
                                                    : driver.safety_score >= 50
                                                        ? '#f59e0b'
                                                        : '#ef4444',
                                            }}
                                        />
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
                                <div className="driverProfileLabel">Member Since</div>
                                <div className="driverProfileValue">{formatDate(driver.created_at)}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
