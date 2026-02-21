/**
 * TripListPage — trip table with status filter.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchTrips } from "../../store/slices/tripSlice";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Pagination from "../../components/Pagination";
import { ROUTES } from "../../constants/routes";
import { TRIP_STATUS } from "../../constants/statuses";
import { formatNumber, formatDateTime } from "../../utils/formatters";
import "../../css/trips.css";
import "../../css/shared.css";
import "../../css/data-table.css";

export default function TripListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, totalCount } = useSelector((s) => s.trips);
  const { role } = useSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchTrips({ page, status_filter: statusFilter }));
  }, [dispatch, page, statusFilter]);

  const columns = [
    { key: "id", label: "ID", render: (r) => `#${r.id}` },
    { key: "origin", label: "Origin" },
    { key: "destination", label: "Destination" },
    {
      key: "cargo_weight_kg",
      label: "Cargo",
      render: (r) => `${formatNumber(r.cargo_weight_kg)} kg`,
    },
    {
      key: "dispatched_at",
      label: "Dispatched",
      render: (r) => formatDateTime(r.dispatched_at),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={r.status} />,
    },
  ];

  const filterOptions = [null, ...Object.values(TRIP_STATUS)];

  // Apply Frontend Filters (Search & Date Range)
  const filteredItems = items.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      String(t.id).includes(searchQuery) ||
      t.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (startDate || endDate) {
      const tDate = new Date(t.created_at || new Date());
      if (startDate && new Date(startDate) > tDate) matchesDate = false;
      const endD = endDate ? new Date(endDate) : null;
      if (endD) {
        endD.setDate(endD.getDate() + 1);
        if (endD < tDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    import("../../utils/csvExport").then(({ exportToCsv }) => {
      const exportCols = [
        { key: "id", label: "Trip ID" },
        { key: "vehicle_id", label: "Vehicle ID" },
        { key: "driver_id", label: "Driver ID" },
        { key: "origin", label: "Origin" },
        { key: "destination", label: "Destination" },
        { key: "cargo_weight_kg", label: "Cargo (kg)" },
        { key: "status", label: "Status" },
        { key: "dispatched_at", label: "Dispatched At" },
        { key: "completed_at", label: "Completed At" },
      ];
      exportToCsv("trips_export.csv", filteredItems, exportCols);
    });
  };

  return (
    <div className="tripWrap">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Trip Dispatcher</h1>
          <p className="pageSubtitle">
            Create and manage shipment trips — {filteredItems.length} trips
            shown
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="secondaryBtn" onClick={handleExport}>
            📥 Export CSV
          </button>
          {["manager", "dispatcher"].includes(role) && (
            <button
              className="primaryBtn"
              onClick={() => navigate(ROUTES.TRIP_NEW)}
            >
              + Create Trip
            </button>
          )}
        </div>
      </div>

      <div
        className="filterBar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {filterOptions.map((f) => (
            <button
              key={f || "all"}
              className={`filterChip${statusFilter === f ? " filterChipActive" : ""}`}
              onClick={() => {
                setStatusFilter(f);
                setPage(1);
              }}
            >
              {f ? f.replace(/_/g, " ") : "All"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            className="formInput"
            placeholder="Search origin, dest, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "6px 10px", width: "220px" }}
          />
          <input
            type="date"
            className="formInput"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: "6px 10px" }}
            title="Start Date"
          />
          <span style={{ color: "var(--text-muted)" }}>-</span>
          <input
            type="date"
            className="formInput"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "6px 10px" }}
            title="End Date"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        onRowClick={(row) => navigate(`/trips/${row.id}`)}
        emptyMessage="No trips found matching criteria."
      />

      <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
    </div>
  );
}
