/**
 * MaintenancePage — list + create form for maintenance logs.
 */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { fetchMaintenanceLogs, createMaintenanceLog, completeMaintenanceLog } from '../../store/slices/maintenanceSlice'
import { fetchVehicles } from '../../store/slices/vehicleSlice'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import StatusPill from '../../components/StatusPill'
import { formatDate, formatCurrency } from '../../utils/formatters'
import '../../css/shared.css'
import '../../css/data-table.css'

export default function MaintenancePage() {
    const dispatch = useDispatch()
    const { items } = useSelector((s) => s.maintenance)
    const { items: vehicles } = useSelector((s) => s.vehicles)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ vehicle_id: '', service_type: '', description: '', cost: '0', service_date: '' })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        dispatch(fetchMaintenanceLogs())
        dispatch(fetchVehicles())
    }, [dispatch])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await dispatch(createMaintenanceLog({
                ...form,
                vehicle_id: parseInt(form.vehicle_id),
                cost: parseFloat(form.cost) || 0,
            })).unwrap()
            toast.success('Maintenance log created — vehicle set to IN SHOP')
            setShowForm(false)
            setForm({ vehicle_id: '', service_type: '', description: '', cost: '0', service_date: '' })
            dispatch(fetchMaintenanceLogs())
        } catch (err) { toast.error(typeof err === 'string' ? err : 'Failed to create log') }
        finally { setSubmitting(false) }
    }

    const handleComplete = async (logId) => {
        try {
            await dispatch(completeMaintenanceLog(logId)).unwrap()
            toast.success('Maintenance completed')
            dispatch(fetchMaintenanceLogs())
        } catch (err) { toast.error(typeof err === 'string' ? err : 'Failed to complete') }
    }

    const columns = [
        { key: 'id', label: 'ID', render: (r) => `#${r.id}` },
        { key: 'vehicle_id', label: 'Vehicle ID' },
        { key: 'service_type', label: 'Service' },
        { key: 'cost', label: 'Cost', render: (r) => formatCurrency(r.cost) },
        { key: 'service_date', label: 'Date', render: (r) => formatDate(r.service_date) },
        {
            key: 'is_completed', label: 'Status',
            render: (r) => r.is_completed
                ? <StatusPill status="COMPLETED" />
                : <StatusPill status="IN_SHOP" />,
        },
        {
            key: 'actions', label: '',
            render: (r) => !r.is_completed && (
                <button className="secondaryBtn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={(e) => { e.stopPropagation(); handleComplete(r.id) }}>
                    ✓ Complete
                </button>
            ),
        },
    ]

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Maintenance & Service Logs</h1>
                    <p className="pageSubtitle">Track preventative and reactive vehicle maintenance</p>
                </div>
                <button className="primaryBtn" onClick={() => setShowForm(true)}>+ Log Maintenance</button>
            </div>

            <DataTable columns={columns} data={items} emptyMessage="No maintenance logs yet." />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Log Maintenance">
                <form onSubmit={handleSubmit}>
                    <div className="formGroup">
                        <label className="formLabel">Vehicle *</label>
                        <select className="formSelect" name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
                            <option value="">Select vehicle...</option>
                            {vehicles.filter(v => v.status !== 'ON_TRIP').map((v) => (
                                <option key={v.id} value={v.id}>{v.name} — {v.license_plate}</option>
                            ))}
                        </select>
                    </div>
                    <div className="formRow">
                        <div className="formGroup">
                            <label className="formLabel">Service Type *</label>
                            <input className="formInput" name="service_type" value={form.service_type} onChange={handleChange} placeholder="e.g. Oil Change" required />
                        </div>
                        <div className="formGroup">
                            <label className="formLabel">Cost (₹)</label>
                            <input className="formInput" name="cost" type="number" step="0.01" min="0" value={form.cost} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Service Date</label>
                        <input className="formInput" name="service_date" type="date" value={form.service_date} onChange={handleChange} />
                    </div>
                    <div className="formGroup">
                        <label className="formLabel">Description</label>
                        <input className="formInput" name="description" value={form.description} onChange={handleChange} placeholder="Additional details..." />
                    </div>
                    <div className="formActions">
                        <button type="button" className="secondaryBtn" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="primaryBtn" disabled={submitting}>{submitting ? 'Saving...' : 'Create Log'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
