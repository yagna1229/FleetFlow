/**
 * TripDetailPage — trip lifecycle view with dispatch/complete/cancel actions.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { apiGet } from '../../api/client'
import { dispatchTrip, completeTrip, cancelTrip } from '../../store/slices/tripSlice'
import StatusPill from '../../components/StatusPill'
import Modal from '../../components/Modal'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ROUTES } from '../../constants/routes'
import { formatNumber, formatDateTime } from '../../utils/formatters'
import '../../css/trips.css'
import '../../css/shared.css'

const LIFECYCLE = ['DRAFT', 'DISPATCHED', 'COMPLETED']

export default function TripDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { role } = useSelector((s) => s.auth)
    const [trip, setTrip] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showDispatch, setShowDispatch] = useState(false)
    const [showComplete, setShowComplete] = useState(false)
    const [odometer, setOdometer] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const load = async () => {
        try {
            setTrip(await apiGet(`/api/v1/trips/${id}`))
        } catch { toast.error('Trip not found'); navigate(ROUTES.TRIPS) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [id])

    const handleDispatch = async () => {
        setSubmitting(true)
        try {
            await dispatch(dispatchTrip({ id: parseInt(id), data: { start_odometer: parseFloat(odometer) } })).unwrap()
            toast.success('Trip dispatched!')
            setShowDispatch(false)
            load()
        } catch (err) { toast.error(typeof err === 'string' ? err : 'Dispatch failed') }
        finally { setSubmitting(false) }
    }

    const handleComplete = async () => {
        setSubmitting(true)
        try {
            await dispatch(completeTrip({ id: parseInt(id), data: { end_odometer: parseFloat(odometer) } })).unwrap()
            toast.success('Trip completed!')
            setShowComplete(false)
            load()
        } catch (err) { toast.error(typeof err === 'string' ? err : 'Completion failed') }
        finally { setSubmitting(false) }
    }

    const handleCancel = async () => {
        if (!confirm('Cancel this trip?')) return
        try {
            await dispatch(cancelTrip(parseInt(id))).unwrap()
            toast.success('Trip cancelled')
            load()
        } catch (err) { toast.error(typeof err === 'string' ? err : 'Cancel failed') }
    }

    if (loading) return <LoadingSpinner />
    if (!trip) return null

    const stepClass = (step) => {
        const steps = LIFECYCLE
        const currentIdx = steps.indexOf(trip.status)
        const stepIdx = steps.indexOf(step)
        if (trip.status === 'CANCELLED') return 'tripStep'
        if (stepIdx < currentIdx) return 'tripStep tripStepDone'
        if (stepIdx === currentIdx) return 'tripStep tripStepActive'
        return 'tripStep'
    }

    return (
        <div className="tripWrap">
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Trip #{trip.id}</h1>
                    <p className="pageSubtitle">{trip.origin} → {trip.destination}</p>
                </div>
                <button className="secondaryBtn" onClick={() => navigate(ROUTES.TRIPS)}>← Back</button>
            </div>

            {/* ── Lifecycle indicator ── */}
            <div className="tripLifecycle">
                {LIFECYCLE.map((step, i) => (
                    <span key={step}>
                        {i > 0 && <span className="tripArrow"> → </span>}
                        <span className={stepClass(step)}>{step}</span>
                    </span>
                ))}
                {trip.status === 'CANCELLED' && (
                    <>
                        <span className="tripArrow"> — </span>
                        <span className="tripStep" style={{ background: 'rgba(239,68,68,0.14)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>CANCELLED</span>
                    </>
                )}
            </div>

            {/* ── Info grid ── */}
            <div className="tripInfoGrid">
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">Status</div>
                    <div className="tripInfoValue"><StatusPill status={trip.status} /></div>
                </div>
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">Cargo</div>
                    <div className="tripInfoValue">{formatNumber(trip.cargo_weight_kg)} kg</div>
                </div>
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">Start Odometer</div>
                    <div className="tripInfoValue">{trip.start_odometer ? `${formatNumber(trip.start_odometer)} km` : '—'}</div>
                </div>
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">End Odometer</div>
                    <div className="tripInfoValue">{trip.end_odometer ? `${formatNumber(trip.end_odometer)} km` : '—'}</div>
                </div>
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">Dispatched At</div>
                    <div className="tripInfoValue">{formatDateTime(trip.dispatched_at)}</div>
                </div>
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">Completed At</div>
                    <div className="tripInfoValue">{formatDateTime(trip.completed_at)}</div>
                </div>
                <div className="tripInfoCard">
                    <div className="tripInfoLabel">Description</div>
                    <div className="tripInfoValue">{trip.cargo_description || '—'}</div>
                </div>
            </div>

            {/* ── Actions ── */}
            {['manager', 'dispatcher'].includes(role) && (
                <div className="tripActions">
                    {trip.status === 'DRAFT' && (
                        <>
                            <button className="primaryBtn" onClick={() => { setOdometer(''); setShowDispatch(true) }}>
                                🚀 Dispatch Trip
                            </button>
                            <button className="dangerBtn" onClick={handleCancel}>Cancel Trip</button>
                        </>
                    )}
                    {trip.status === 'DISPATCHED' && (
                        <>
                            <button className="primaryBtn" onClick={() => { setOdometer(''); setShowComplete(true) }}>
                                ✅ Complete Trip
                            </button>
                            <button className="dangerBtn" onClick={handleCancel}>Cancel Trip</button>
                        </>
                    )}
                </div>
            )}

            {/* ── Dispatch modal ── */}
            <Modal isOpen={showDispatch} onClose={() => setShowDispatch(false)} title="Dispatch Trip">
                <div className="formGroup">
                    <label className="formLabel">Start Odometer (km) *</label>
                    <input className="formInput" type="number" step="0.01" min="0" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="Current odometer reading" required />
                </div>
                <div className="formActions">
                    <button className="secondaryBtn" onClick={() => setShowDispatch(false)}>Cancel</button>
                    <button className="primaryBtn" disabled={!odometer || submitting} onClick={handleDispatch}>
                        {submitting ? 'Dispatching...' : 'Confirm Dispatch'}
                    </button>
                </div>
            </Modal>

            {/* ── Complete modal ── */}
            <Modal isOpen={showComplete} onClose={() => setShowComplete(false)} title="Complete Trip">
                <div className="formGroup">
                    <label className="formLabel">End Odometer (km) *</label>
                    <input className="formInput" type="number" step="0.01" min="0" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="Final odometer reading" required />
                </div>
                <div className="formActions">
                    <button className="secondaryBtn" onClick={() => setShowComplete(false)}>Cancel</button>
                    <button className="primaryBtn" disabled={!odometer || submitting} onClick={handleComplete}>
                        {submitting ? 'Completing...' : 'Confirm Completion'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}
