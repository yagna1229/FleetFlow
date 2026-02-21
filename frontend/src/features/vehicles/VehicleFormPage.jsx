/**
 * VehicleFormPage — Create or Edit a vehicle.
 */
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createVehicle } from '../../store/slices/vehicleSlice'
import { VEHICLE_TYPE } from '../../constants/statuses'
import { ROUTES } from '../../constants/routes'
import '../../css/shared.css'
import '../../css/vehicles.css'

export default function VehicleFormPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '',
        model: '',
        vehicle_type: 'VAN',
        license_plate: '',
        max_capacity_kg: '',
        odometer_km: '0',
        acquisition_cost: '0',
        region: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        const payload = {
            ...form,
            max_capacity_kg: parseFloat(form.max_capacity_kg) || 0,
            odometer_km: parseFloat(form.odometer_km) || 0,
            acquisition_cost: parseFloat(form.acquisition_cost) || 0,
        }

        try {
            await dispatch(createVehicle(payload)).unwrap()
            toast.success('Vehicle created successfully!')
            navigate(ROUTES.VEHICLES)
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Failed to create vehicle')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Add New Vehicle</h1>
                    <p className="pageSubtitle">Register a new fleet asset</p>
                </div>
                <button className="secondaryBtn" onClick={() => navigate(ROUTES.VEHICLES)}>
                    ← Back to List
                </button>
            </div>

            <form className="vehicleForm" onSubmit={handleSubmit}>
                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Vehicle Name *</label>
                        <input
                            className="formInput"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Van-05"
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Model</label>
                        <input
                            className="formInput"
                            name="model"
                            value={form.model}
                            onChange={handleChange}
                            placeholder="e.g. Tata Ace"
                        />
                    </div>
                </div>

                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Vehicle Type *</label>
                        <select className="formSelect" name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
                            {Object.values(VEHICLE_TYPE).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">License Plate *</label>
                        <input
                            className="formInput"
                            name="license_plate"
                            value={form.license_plate}
                            onChange={handleChange}
                            placeholder="e.g. MH-12-AB-1234"
                            required
                        />
                    </div>
                </div>

                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Max Capacity (kg) *</label>
                        <input
                            className="formInput"
                            name="max_capacity_kg"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={form.max_capacity_kg}
                            onChange={handleChange}
                            placeholder="e.g. 500"
                            required
                        />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Odometer (km)</label>
                        <input
                            className="formInput"
                            name="odometer_km"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.odometer_km}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="formRow">
                    <div className="formGroup">
                        <label className="formLabel">Acquisition Cost (₹)</label>
                        <input
                            className="formInput"
                            name="acquisition_cost"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.acquisition_cost}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Region</label>
                        <input
                            className="formInput"
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai, Delhi"
                        />
                    </div>
                </div>

                <div className="formActions">
                    <button type="button" className="secondaryBtn" onClick={() => navigate(ROUTES.VEHICLES)}>
                        Cancel
                    </button>
                    <button type="submit" className="primaryBtn" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Vehicle'}
                    </button>
                </div>
            </form>
        </div>
    )
}
