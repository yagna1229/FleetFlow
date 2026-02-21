/**
 * VehicleListPage — data table with status filter and action buttons.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchVehicles } from "../../store/slices/vehicleSlice";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Pagination from "../../components/Pagination";
import { ROUTES } from "../../constants/routes";
import { VEHICLE_STATUS } from "../../constants/statuses";
import { formatNumber, formatDateTime } from "../../utils/formatters";
import "../../css/vehicles.css";
import "../../css/shared.css";
import "../../css/data-table.css";

export default function VehicleListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, totalCount } = useSelector((s) => s.vehicles);
  const { role } = useSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchVehicles({ page, status_filter: statusFilter }));
  }, [dispatch, page, statusFilter]);

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "license_plate",
      label: "License Plate",
      render: (r) => <code>{r.license_plate}</code>,
    },
    { key: "vehicle_type", label: "Type" },
    {
      key: "max_capacity_kg",
      label: "Capacity",
      render: (r) => `${formatNumber(r.max_capacity_kg)} kg`,
    },
    {
      key: "odometer_km",
      label: "Odometer",
      render: (r) => `${formatNumber(r.odometer_km)} km`,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={r.status} />,
    },
    { key: "region", label: "Region" },
  ];

  const filterOptions = [null, ...Object.values(VEHICLE_STATUS)];

  // Apply Frontend Filters (Search & Date Range)
  const filteredItems = items.filter((v) => {
    const matchesSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (startDate || endDate) {
      const vDate = new Date(v.created_at || new Date());
      if (startDate && new Date(startDate) > vDate) matchesDate = false;
      // Add extra day to include entire end date
      const endD = endDate ? new Date(endDate) : null;
      if (endD) {
        endD.setDate(endD.getDate() + 1);
        if (endD < vDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    import("../../utils/csvExport").then(({ exportToCsv }) => {
      const exportCols = [
        { key: "id", label: "Vehicle ID" },
        { key: "name", label: "Name" },
        { key: "license_plate", label: "License Plate" },
        { key: "vehicle_type", label: "Type" },
        { key: "max_capacity_kg", label: "Capacity (kg)" },
        { key: "odometer_km", label: "Odometer (km)" },
        { key: "status", label: "Status" },
        { key: "region", label: "Region" },
      ];
      exportToCsv("vehicles_export.csv", filteredItems, exportCols);
    });
  };

  return (
    <div className="vehicleWrap">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Vehicle Registry</h1>
          <p className="pageSubtitle">
            Manage fleet assets — {filteredItems.length} vehicles shown
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="secondaryBtn" onClick={handleExport}>
            📥 Export CSV
          </button>
          {role === "manager" && (
            <button
              className="primaryBtn"
              onClick={() => navigate(ROUTES.VEHICLE_NEW)}
            >
              + Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* ── Status filter chips ── */}
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
            placeholder="Search name or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: "6px 10px", width: "200px" }}
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
        onRowClick={(row) => navigate(`/vehicles/${row.id}`)}
        emptyMessage="No vehicles found matching criteria."
      />

      <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
    </div>
  );
}
