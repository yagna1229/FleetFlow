/**
 * VehicleListPage — data table with status filter and action buttons.
 */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchVehicles } from '../../store/slices/vehicleSlice'
import DataTable from '../../components/DataTable'
import StatusPill from '../../components/StatusPill'
import Pagination from '../../components/Pagination'
import { ROUTES } from '../../constants/routes'
import { VEHICLE_STATUS } from '../../constants/statuses'
import { formatNumber, formatDateTime } from '../../utils/formatters'
import '../../css/vehicles.css'
import '../../css/shared.css'
import '../../css/data-table.css'

export default function VehicleListPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, status, totalCount } = useSelector((s) => s.vehicles)
    const { role } = useSelector((s) => s.auth)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState(null)

    useEffect(() => {
        dispatch(fetchVehicles({ page, status_filter: statusFilter }))
    }, [dispatch, page, statusFilter])

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'license_plate', label: 'License Plate', render: (r) => <code>{r.license_plate}</code> },
        { key: 'vehicle_type', label: 'Type' },
        { key: 'max_capacity_kg', label: 'Capacity', render: (r) => `${formatNumber(r.max_capacity_kg)} kg` },
        { key: 'odometer_km', label: 'Odometer', render: (r) => `${formatNumber(r.odometer_km)} km` },
        { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
        { key: 'region', label: 'Region' },
    ]

    const filterOptions = [null, ...Object.values(VEHICLE_STATUS)]

    return (
        <div className="vehicleWrap">
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Vehicle Registry</h1>
                    <p className="pageSubtitle">Manage fleet assets — {items.length} vehicles shown</p>
                </div>
                {role === 'manager' && (
                    <button className="primaryBtn" onClick={() => navigate(ROUTES.VEHICLE_NEW)}>
                        + Add Vehicle
                    </button>
                )}
            </div>

            {/* ── Status filter chips ── */}
            <div className="filterBar">
                {filterOptions.map((f) => (
                    <button
                        key={f || 'all'}
                        className={`filterChip${statusFilter === f ? ' filterChipActive' : ''}`}
                        onClick={() => { setStatusFilter(f); setPage(1) }}
                    >
                        {f ? f.replace(/_/g, ' ') : 'All'}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={items}
                onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
                emptyMessage="No vehicles found. Add your first vehicle to get started."
            />

            <Pagination
                page={page}
                totalCount={totalCount}
                onPageChange={setPage}
            />
        </div>
    )
}
