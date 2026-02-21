/**
 * TripListPage — trip table with status filter.
 */
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchTrips } from '../../store/slices/tripSlice'
import DataTable from '../../components/DataTable'
import StatusPill from '../../components/StatusPill'
import Pagination from '../../components/Pagination'
import { ROUTES } from '../../constants/routes'
import { TRIP_STATUS } from '../../constants/statuses'
import { formatNumber, formatDateTime } from '../../utils/formatters'
import '../../css/trips.css'
import '../../css/shared.css'
import '../../css/data-table.css'

export default function TripListPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { items, status, totalCount } = useSelector((s) => s.trips)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState(null)

    useEffect(() => {
        dispatch(fetchTrips({ page, status_filter: statusFilter }))
    }, [dispatch, page, statusFilter])

    const columns = [
        { key: 'id', label: 'ID', render: (r) => `#${r.id}` },
        { key: 'origin', label: 'Origin' },
        { key: 'destination', label: 'Destination' },
        { key: 'cargo_weight_kg', label: 'Cargo', render: (r) => `${formatNumber(r.cargo_weight_kg)} kg` },
        { key: 'dispatched_at', label: 'Dispatched', render: (r) => formatDateTime(r.dispatched_at) },
        { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
    ]

    const filterOptions = [null, ...Object.values(TRIP_STATUS)]

    return (
        <div className="tripWrap">
            <div className="pageHeader">
                <div>
                    <h1 className="pageTitle">Trip Dispatcher</h1>
                    <p className="pageSubtitle">Create and manage shipment trips</p>
                </div>
                <button className="primaryBtn" onClick={() => navigate(ROUTES.TRIP_NEW)}>
                    + Create Trip
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
                onRowClick={(row) => navigate(`/trips/${row.id}`)}
                emptyMessage="No trips yet. Create your first trip to start dispatching."
            />

            <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
        </div>
    )
}
