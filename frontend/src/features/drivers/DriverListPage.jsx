/**
 * DriverListPage — data table with status filter.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDrivers } from "../../store/slices/driverSlice";
import DataTable from "../../components/DataTable";
import StatusPill from "../../components/StatusPill";
import Pagination from "../../components/Pagination";
import { ROUTES } from "../../constants/routes";
import { DRIVER_STATUS } from "../../constants/statuses";
import { formatDate } from "../../utils/formatters";
import "../../css/drivers.css";
import "../../css/shared.css";
import "../../css/data-table.css";

export default function DriverListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, totalCount } = useSelector((s) => s.drivers);
  const { role } = useSelector((s) => s.auth);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchDrivers({ page, status_filter: statusFilter }));
  }, [dispatch, page, statusFilter]);

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "license_number", label: "License #" },
    { key: "license_category", label: "Category" },
    {
      key: "license_expiry",
      label: "License Expiry",
      render: (r) => {
        const isExpired = new Date(r.license_expiry) <= new Date();
        return (
          <span style={isExpired ? { color: "#f87171" } : {}}>
            {formatDate(r.license_expiry)}
          </span>
        );
      },
    },
    {
      key: "safety_score",
      label: "Safety",
      render: (r) => `${r.safety_score}%`,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusPill status={r.status} />,
    },
  ];

  const filterOptions = [null, ...Object.values(DRIVER_STATUS)];

  // Apply Frontend Filters (Search & Date Range)
  const filteredItems = items.filter((d) => {
    const matchesSearch =
      !searchQuery ||
      d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.license_number.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (startDate || endDate) {
      const dDate = new Date(d.created_at || new Date());
      if (startDate && new Date(startDate) > dDate) matchesDate = false;
      const endD = endDate ? new Date(endDate) : null;
      if (endD) {
        endD.setDate(endD.getDate() + 1);
        if (endD < dDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    import("../../utils/csvExport").then(({ exportToCsv }) => {
      const exportCols = [
        { key: "id", label: "Driver ID" },
        { key: "full_name", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "license_number", label: "License #" },
        { key: "license_category", label: "Category" },
        { key: "license_expiry", label: "Expiry Date" },
        { key: "safety_score", label: "Safety Score" },
        { key: "status", label: "Status" },
      ];
      exportToCsv("drivers_export.csv", filteredItems, exportCols);
    });
  };

  return (
    <div className="driverWrap">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Driver Profiles</h1>
          <p className="pageSubtitle">
            Manage drivers & compliance — {filteredItems.length} drivers shown
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="secondaryBtn" onClick={handleExport}>
            📥 Export CSV
          </button>
          {role === "manager" && (
            <button
              className="primaryBtn"
              onClick={() => navigate(ROUTES.DRIVER_NEW)}
            >
              + Add Driver
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
            placeholder="Search name, email, license..."
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
        onRowClick={(row) => navigate(`/drivers/${row.id}`)}
        emptyMessage="No drivers found matching criteria."
      />

      <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
    </div>
  );
}
