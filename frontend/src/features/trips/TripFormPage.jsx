/**
 * TripFormPage — create a trip with vehicle/driver selection and capacity validation.
 */
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createTrip } from '../../store/slices/tripSlice'
import { fetchAvailableVehicles } from '../../store/slices/vehicleSlice'
import { fetchAvailableDrivers } from '../../store/slices/driverSlice'
import { ROUTES } from '../../constants/routes'
import '../../css/shared.css'

export default function TripFormPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { available: availableVehicles } = useSelector((s) => s.vehicles)
    const { available: availableDrivers } = useSelector((s) => s.drivers)
    const [form, setForm] = useState({
        vehicle_id: '',
        driver_id: '',
        origin: '',
        destination: '',
        cargo_weight_kg: '',
        cargo_description: '',
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        dispatch(fetchAvailableVehicles())
        dispatch(fetchAvailableDrivers())
    }, [dispatch])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const selectedVehicle = availableVehicles.find((v) => v.id === parseInt(form.vehicle_id))
    const cargoExceeds = selectedVehicle && form.cargo_weight_kg
        ? parseFloat(form.cargo_weight_kg) > selectedVehicle.max_capacity_kg
        : false

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (cargoExceeds) {
            toast.error(`Cargo exceeds vehicle capacity (${selectedVehicle.max_capacity_kg} kg)`)
            return
        }
        setSubmitting(true)
        try {
            const payload = {
                ...form,
                vehicle_id: parseInt(form.vehicle_id),
                driver_id: parseInt(form.driver_id),
                cargo_weight_kg: parseFloat(form.cargo_weight_kg),
            }
            await dispatch(createTrip(payload)).unwrap()
            toast.success('Trip created as DRAFT!')
            navigate(ROUTES.TRIPS)
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to create trip')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Create New Trip</h1>
                    <p className="pageSubtitle">Assign a vehicle and driver to a shipment</p>
                </div>
                <button className="secondaryBtn" onClick={() => navigate(ROUTES.TRIPS)}>← Back</button>
            </div>

            <form style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Vehicle *</label>
                        <select className="formSelect" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
                            <option value="">Select available vehicle...</option>
                            {availableVehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.name} — {v.license_plate} ({v.max_capacity_kg} kg)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Driver *</label>
                        <select className="formSelect" name="driver_id" value={form.driver_id} onChange={handleChange} required>
                            <option value="">Select available driver...</option>
                            {availableDrivers.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.full_name} ({d.license_category})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Origin *</label>
                        <input className="formInput" name="origin" value={form.origin} onChange={handleChange} placeholder="e.g. Mumbai Warehouse" required />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Destination *</label>
                        <input className="formInput" name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Delhi Hub" required />
                    </div>
                </div>

                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Cargo Weight (kg) *</label>
                        <input
                            className="formInput"
                            name="cargo_weight_kg"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={form.cargo_weight_kg}
                            onChange={handleChange}
                            required
                            style={cargoExceeds ? { borderColor: '#ef4444' } : {}}
                        />
                        {cargoExceeds && (
                            <span style={{ color: '#f87171', fontSize: 12 }}>
                                ⚠ Exceeds vehicle capacity ({selectedVehicle.max_capacity_kg} kg)
                            </span>
                        )}
                        {selectedVehicle && !cargoExceeds && form.cargo_weight_kg && (
                            <span style={{ color: '#34d399', fontSize: 12 }}>
                                ✓ Within capacity ({selectedVehicle.max_capacity_kg} kg)
                            </span>
                        )}
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Cargo Description</label>
                        <input className="formInput" name="cargo_description" value={form.cargo_description} onChange={handleChange} placeholder="e.g. Electronics, 50 boxes" />
                    </div>
                </div>

                <div className="formActions">
                    <button type="button" className="secondaryBtn" onClick={() => navigate(ROUTES.TRIPS)}>Cancel</button>
                    <button type="submit" className="primaryBtn" disabled={submitting || cargoExceeds}>
                        {submitting ? 'Creating...' : 'Create Draft Trip'}
                    </button>
                </div>
            </form>
        </div>
    )
}
