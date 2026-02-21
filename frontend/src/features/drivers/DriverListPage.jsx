/**
 * DriverListPage — data table with status filter.
 */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchDrivers } from '../../store/slices/driverSlice'
import DataTable from '../../components/DataTable'
import StatusPill from '../../components/StatusPill'
import Pagination from '../../components/Pagination'
import { ROUTES } from '../../constants/routes'
import { DRIVER_STATUS } from '../../constants/statuses'
import { formatDate } from '../../utils/formatters'
import '../../css/drivers.css'
import '../../css/shared.css'
import '../../css/data-table.css'

export default function DriverListPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, status, totalCount } = useSelector((s) => s.drivers)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState(null)

    useEffect(() => {
        dispatch(fetchDrivers({ page, status_filter: statusFilter }))
    }, [dispatch, page, statusFilter])

    const columns = [
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'license_number', label: 'License #' },
        { key: 'license_category', label: 'Category' },
        {
            key: 'license_expiry', label: 'License Expiry',
            render: (r) => {
                const isExpired = new Date(r.license_expiry) <= new Date()
                return <span style={isExpired ? { color: '#f87171' } : {}}>{formatDate(r.license_expiry)}</span>
            },
        },
        { key: 'safety_score', label: 'Safety', render: (r) => `${r.safety_score}%` },
        { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
    ]

    const filterOptions = [null, ...Object.values(DRIVER_STATUS)]

    return (
        <div className="driverWrap">
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Driver Profiles</h1>
                    <p className="pageSubtitle">Manage drivers & compliance — {items.length} drivers shown</p>
                </div>
                <button className="primaryBtn" onClick={() => navigate(ROUTES.DRIVER_NEW)}>
                    + Add Driver
                </button>
            </div>

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
                onRowClick={(row) => navigate(`/drivers/${row.id}`)}
                emptyMessage="No drivers found. Add your first driver to get started."
            />

            <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
        </div>
    )
}
