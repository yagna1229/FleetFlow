/**
 * MaintenancePage — list + create form for maintenance logs.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchMaintenanceLogs,
  createMaintenanceLog,
  completeMaintenanceLog,
} from "../../store/slices/maintenanceSlice";
import { fetchVehicles } from "../../store/slices/vehicleSlice";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import StatusPill from "../../components/StatusPill";
import { formatDate, formatCurrency } from "../../utils/formatters";
import "../../css/shared.css";
import "../../css/data-table.css";

export default function MaintenancePage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.maintenance);
  const { items: vehicles } = useSelector((s) => s.vehicles);
  const { role } = useSelector((s) => s.auth);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vehicle_id: "",
    service_type: "",
    description: "",
    cost: "0",
    service_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchMaintenanceLogs());
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(
        createMaintenanceLog({
          ...form,
          vehicle_id: parseInt(form.vehicle_id),
          cost: parseFloat(form.cost) || 0,
        }),
      ).unwrap();
      toast.success("Maintenance log created — vehicle set to IN SHOP");
      setShowForm(false);
      setForm({
        vehicle_id: "",
        service_type: "",
        description: "",
        cost: "0",
        service_date: "",
      });
      dispatch(fetchMaintenanceLogs());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to create log");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (logId) => {
    try {
      await dispatch(completeMaintenanceLog(logId)).unwrap();
      toast.success("Maintenance completed");
      dispatch(fetchMaintenanceLogs());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to complete");
    }
  };

  const columns = [
    { key: "id", label: "ID", render: (r) => `#${r.id}` },
    { key: "vehicle_id", label: "Vehicle ID" },
    { key: "service_type", label: "Service" },
    { key: "cost", label: "Cost", render: (r) => formatCurrency(r.cost) },
    {
      key: "service_date",
      label: "Date",
      render: (r) => formatDate(r.service_date),
    },
    {
      key: "is_completed",
      label: "Status",
      render: (r) =>
        r.is_completed ? (
          <StatusPill status="COMPLETED" />
        ) : (
          <StatusPill status="IN_SHOP" />
        ),
    },
    {
      key: "actions",
      label: "",
      render: (r) =>
        !r.is_completed &&
        ["manager", "safety_officer"].includes(role) && (
          <button
            className="secondaryBtn"
            style={{ padding: "4px 10px", fontSize: 12 }}
            onClick={(e) => {
              e.stopPropagation();
              handleComplete(r.id);
            }}
          >
            ✓ Complete
          </button>
        ),
    },
  ];

  // Apply Frontend Filters (Search & Date Range)
  const filteredItems = items.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      String(m.id).includes(searchQuery) ||
      String(m.vehicle_id).includes(searchQuery) ||
      m.service_type.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesDate = true;
    if (startDate || endDate) {
      const mDate = new Date(m.service_date || m.created_at || new Date());
      if (startDate && new Date(startDate) > mDate) matchesDate = false;
      const endD = endDate ? new Date(endDate) : null;
      if (endD) {
        endD.setDate(endD.getDate() + 1);
        if (endD < mDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    import("../../utils/csvExport").then(({ exportToCsv }) => {
      const exportCols = [
        { key: "id", label: "Log ID" },
        { key: "vehicle_id", label: "Vehicle ID" },
        { key: "service_type", label: "Service Type" },
        { key: "description", label: "Description" },
        { key: "cost", label: "Cost" },
        { key: "service_date", label: "Service Date" },
        { key: "is_completed", label: "Completed" },
      ];
      exportToCsv("maintenance_export.csv", filteredItems, exportCols);
    });
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Maintenance & Service Logs</h1>
          <p className="pageSubtitle">
            Track preventative and reactive vehicle maintenance —{" "}
            {filteredItems.length} logs shown
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="secondaryBtn" onClick={handleExport}>
            📥 Export CSV
          </button>
          {["manager", "safety_officer"].includes(role) && (
            <button className="primaryBtn" onClick={() => setShowForm(true)}>
              + Log Maintenance
            </button>
          )}
        </div>
      </div>

      <div
        className="filterBar"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "10px 0",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            className="formInput"
            placeholder="Search service, ID, Vehicle ID..."
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
        emptyMessage="No maintenance logs found matching criteria."
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Log Maintenance"
      >
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label className="formLabel">Vehicle *</label>
            <select
              className="formSelect"
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleChange}
              required
            >
              <option value="">Select vehicle...</option>
              {vehicles
                .filter((v) => v.status !== "ON_TRIP")
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.license_plate}
                  </option>
                ))}
            </select>
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label className="formLabel">Service Type *</label>
              <input
                className="formInput"
                name="service_type"
                value={form.service_type}
                onChange={handleChange}
                placeholder="e.g. Oil Change"
                required
              />
            </div>
            <div className="formGroup">
              <label className="formLabel">Cost (₹)</label>
              <input
                className="formInput"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                value={form.cost}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="formGroup">
            <label className="formLabel">Service Date</label>
            <input
              className="formInput"
              name="service_date"
              type="date"
              value={form.service_date}
              onChange={handleChange}
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Description</label>
            <input
              className="formInput"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Additional details..."
            />
          </div>
          <div className="formActions">
            <button
              type="button"
              className="secondaryBtn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primaryBtn" disabled={submitting}>
              {submitting ? "Saving..." : "Create Log"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
