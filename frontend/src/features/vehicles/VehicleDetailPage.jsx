/**
 * VehicleDetailPage — single vehicle info + status management.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { apiGet } from '../../api/client'
import { retireVehicle } from '../../store/slices/vehicleSlice'
import StatusPill from '../../components/StatusPill'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ROUTES } from '../../constants/routes'
import { formatNumber, formatDateTime, formatCurrency } from '../../utils/formatters'
import '../../css/vehicles.css'
import '../../css/shared.css'

export default function VehicleDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [vehicle, setVehicle] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadVehicle()
    }, [id])

    async function loadVehicle() {
        try {
            const data = await apiGet(`/api/v1/vehicles/${id}`)
            setVehicle(data)
        } catch {
            toast.error('Vehicle not found')
            navigate(ROUTES.VEHICLES)
        } finally {
            setLoading(false)
        }
    }

    const handleRetire = async () => {
        if (!confirm('Are you sure you want to retire this vehicle?')) return
        try {
            await dispatch(retireVehicle(vehicle.id)).unwrap()
            toast.success('Vehicle retired')
            loadVehicle()
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to retire')
        }
    }

    if (loading) return <LoadingSpinner />
    if (!vehicle) return null

    return (
        <div className="vehicleDetail">
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">{vehicle.name}</h1>
                    <p className="pageSubtitle">{vehicle.model || vehicle.vehicle_type} — {vehicle.license_plate}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondaryBtn" onClick={() => navigate(ROUTES.VEHICLES)}>← Back</button>
                    {vehicle.status !== 'RETIRED' && (
                        <button className="dangerBtn" onClick={handleRetire}>Retire Vehicle</button>
                    )}
                </div>
            </div>

            {/* ── Info grid ── */}
            <div className="vehicleInfoGrid">
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Status</div>
                    <div className="vehicleInfoValue"><StatusPill status={vehicle.status} /></div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Type</div>
                    <div className="vehicleInfoValue">{vehicle.vehicle_type}</div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">License Plate</div>
                    <div className="vehicleInfoValue"><code>{vehicle.license_plate}</code></div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Max Capacity</div>
                    <div className="vehicleInfoValue">{formatNumber(vehicle.max_capacity_kg)} kg</div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Odometer</div>
                    <div className="vehicleInfoValue">{formatNumber(vehicle.odometer_km)} km</div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Acquisition Cost</div>
                    <div className="vehicleInfoValue">{formatCurrency(vehicle.acquisition_cost)}</div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Region</div>
                    <div className="vehicleInfoValue">{vehicle.region || '—'}</div>
                </div>
                <div className="vehicleInfoItem">
                    <div className="vehicleInfoLabel">Added On</div>
                    <div className="vehicleInfoValue">{formatDateTime(vehicle.created_at)}</div>
                </div>
            </div>
        </div>
    )
}
