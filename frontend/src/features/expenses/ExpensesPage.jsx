/**
 * ExpensesPage — fuel logs + trip expenses in one page.
 */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchFuelLogs, createFuelLog } from "../../store/slices/fuelSlice";
import { fetchExpenses, createExpense } from "../../store/slices/expenseSlice";
import { fetchTrips } from "../../store/slices/tripSlice";
import { fetchVehicles } from "../../store/slices/vehicleSlice";
import { apiGet } from "../../api/client";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import {
  formatDate,
  formatCurrency,
  formatNumber,
} from "../../utils/formatters";
import { EXPENSE_CATEGORY } from "../../constants/statuses";
import "../../css/shared.css";
import "../../css/data-table.css";

export default function ExpensesPage() {
  const dispatch = useDispatch();
  const { items: fuelLogs } = useSelector((s) => s.fuel);
  const { items: expenses } = useSelector((s) => s.expenses);
  const { items: trips } = useSelector((s) => s.trips);
  const { items: vehicles } = useSelector((s) => s.vehicles);
  const { role } = useSelector((s) => s.auth);
  const [tab, setTab] = useState("fuel");
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [fuelForm, setFuelForm] = useState({
    trip_id: "",
    vehicle_id: "",
    liters: "",
    cost: "",
    fuel_date: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    trip_id: "",
    category: "TOLL",
    description: "",
    amount: "",
    expense_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    dispatch(fetchFuelLogs());
    dispatch(fetchExpenses());
    dispatch(fetchTrips());
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { fuel_date, ...rest } = fuelForm;
      await dispatch(
        createFuelLog({
          ...rest,
          refuel_date: fuel_date || new Date().toISOString().split("T")[0],
          trip_id: parseInt(fuelForm.trip_id),
          vehicle_id: parseInt(fuelForm.vehicle_id),
          liters: parseFloat(fuelForm.liters),
          cost: parseFloat(fuelForm.cost),
        }),
      ).unwrap();
      toast.success("Fuel log added");
      setShowFuelForm(false);
      setFuelForm({
        trip_id: "",
        vehicle_id: "",
        liters: "",
        cost: "",
        fuel_date: "",
      });
      dispatch(fetchFuelLogs());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(
        createExpense({
          ...expenseForm,
          trip_id: parseInt(expenseForm.trip_id),
          amount: parseFloat(expenseForm.amount),
        }),
      ).unwrap();
      toast.success("Expense added");
      setShowExpenseForm(false);
      dispatch(fetchExpenses());
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Apply Frontend Filters (Search & Date Range)
  const filteredFuel = fuelLogs.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      String(f.id).includes(searchQuery) ||
      String(f.vehicle_id).includes(searchQuery) ||
      String(f.trip_id).includes(searchQuery);
    let matchesDate = true;
    if (startDate || endDate) {
      const d = new Date(f.refuel_date || f.created_at || new Date());
      if (startDate && new Date(startDate) > d) matchesDate = false;
      const endD = endDate ? new Date(endDate) : null;
      if (endD) {
        endD.setDate(endD.getDate() + 1);
        if (endD < d) matchesDate = false;
      }
    }
    return matchesSearch && matchesDate;
  });

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      String(e.id).includes(searchQuery) ||
      String(e.trip_id).includes(searchQuery) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    let matchesDate = true;
    if (startDate || endDate) {
      const d = new Date(e.expense_date || e.created_at || new Date());
      if (startDate && new Date(startDate) > d) matchesDate = false;
      const endD = endDate ? new Date(endDate) : null;
      if (endD) {
        endD.setDate(endD.getDate() + 1);
        if (endD < d) matchesDate = false;
      }
    }
    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    import("../../utils/csvExport").then(({ exportToCsv }) => {
      if (tab === "fuel") {
        const cols = [
          { key: "id", label: "Fuel Log ID" },
          { key: "trip_id", label: "Trip ID" },
          { key: "vehicle_id", label: "Vehicle ID" },
          { key: "liters", label: "Liters" },
          { key: "cost", label: "Cost" },
          { key: "refuel_date", label: "Refuel Date" },
        ];
        exportToCsv("fuel_logs_export.csv", filteredFuel, cols);
      } else {
        const cols = [
          { key: "id", label: "Expense ID" },
          { key: "trip_id", label: "Trip ID" },
          { key: "category", label: "Category" },
          { key: "description", label: "Description" },
          { key: "amount", label: "Amount" },
          { key: "expense_date", label: "Expense Date" },
        ];
        exportToCsv("expenses_export.csv", filteredExpenses, cols);
      }
    });
  };

  const fuelColumns = [
    { key: "id", label: "ID", render: (r) => `#${r.id}` },
    { key: "vehicle_id", label: "Vehicle" },
    { key: "trip_id", label: "Trip" },
    {
      key: "liters",
      label: "Liters",
      render: (r) => `${formatNumber(r.liters)} L`,
    },
    { key: "cost", label: "Cost", render: (r) => formatCurrency(r.cost) },
    {
      key: "refuel_date",
      label: "Date",
      render: (r) => formatDate(r.refuel_date),
    },
  ];

  const expenseColumns = [
    { key: "id", label: "ID", render: (r) => `#${r.id}` },
    { key: "trip_id", label: "Trip" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description" },
    { key: "amount", label: "Amount", render: (r) => formatCurrency(r.amount) },
    {
      key: "expense_date",
      label: "Date",
      render: (r) => formatDate(r.expense_date),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Expenses & Fuel Logging</h1>
          <p className="pageSubtitle">
            Track fuel consumption and trip expenses
          </p>
        </div>
        {role === "manager" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="primaryBtn"
              onClick={() => setShowFuelForm(true)}
            >
              + Fuel Log
            </button>
            <button
              className="primaryBtn"
              onClick={() => setShowExpenseForm(true)}
            >
              + Expense
            </button>
          </div>
        )}
      </div>

      {/* ── Tab switcher ── */}
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
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`filterChip${tab === "fuel" ? " filterChipActive" : ""}`}
            onClick={() => setTab("fuel")}
          >
            ⛽ Fuel Logs
          </button>
          <button
            className={`filterChip${tab === "expenses" ? " filterChipActive" : ""}`}
            onClick={() => setTab("expenses")}
          >
            💳 Trip Expenses
          </button>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="secondaryBtn"
            onClick={handleExport}
            style={{ marginRight: "8px" }}
          >
            📥 Export CSV
          </button>
          <input
            type="text"
            className="formInput"
            placeholder={
              tab === "fuel"
                ? "Search vehicle, trip ID..."
                : "Search desc, category, trip ID..."
            }
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

      {tab === "fuel" && (
        <DataTable
          columns={fuelColumns}
          data={fuelLogs}
          emptyMessage="No fuel logs yet."
        />
      )}
      {tab === "expenses" && (
        <DataTable
          columns={expenseColumns}
          data={expenses}
          emptyMessage="No expenses yet."
        />
      )}

      {/* ── Fuel form modal ── */}
      <Modal
        isOpen={showFuelForm}
        onClose={() => setShowFuelForm(false)}
        title="Add Fuel Log"
      >
        <form onSubmit={handleFuelSubmit}>
          <div className="formRow">
            <div className="formGroup">
              <label className="formLabel">Trip *</label>
              <select
                className="formSelect"
                value={fuelForm.trip_id}
                onChange={(e) =>
                  setFuelForm({ ...fuelForm, trip_id: e.target.value })
                }
                required
              >
                <option value="">Select trip...</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} — {t.origin} → {t.destination}
                  </option>
                ))}
              </select>
            </div>
            <div className="formGroup">
              <label className="formLabel">Vehicle *</label>
              <select
                className="formSelect"
                value={fuelForm.vehicle_id}
                onChange={(e) =>
                  setFuelForm({ ...fuelForm, vehicle_id: e.target.value })
                }
                required
              >
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.license_plate}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label className="formLabel">Liters *</label>
              <input
                className="formInput"
                type="number"
                step="0.01"
                min="0.01"
                value={fuelForm.liters}
                onChange={(e) =>
                  setFuelForm({ ...fuelForm, liters: e.target.value })
                }
                required
              />
            </div>
            <div className="formGroup">
              <label className="formLabel">Cost (₹) *</label>
              <input
                className="formInput"
                type="number"
                step="0.01"
                min="0"
                value={fuelForm.cost}
                onChange={(e) =>
                  setFuelForm({ ...fuelForm, cost: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="formGroup">
            <label className="formLabel">Date</label>
            <input
              className="formInput"
              type="date"
              value={fuelForm.fuel_date}
              onChange={(e) =>
                setFuelForm({ ...fuelForm, fuel_date: e.target.value })
              }
            />
          </div>
          <div className="formActions">
            <button
              type="button"
              className="secondaryBtn"
              onClick={() => setShowFuelForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primaryBtn" disabled={submitting}>
              {submitting ? "Saving..." : "Add Fuel Log"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Expense form modal ── */}
      <Modal
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        title="Add Expense"
      >
        <form onSubmit={handleExpenseSubmit}>
          <div className="formGroup">
            <label className="formLabel">Trip *</label>
            <select
              className="formSelect"
              value={expenseForm.trip_id}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, trip_id: e.target.value })
              }
              required
            >
              <option value="">Select trip...</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} — {t.origin} → {t.destination}
                </option>
              ))}
            </select>
          </div>
          <div className="formRow">
            <div className="formGroup">
              <label className="formLabel">Category *</label>
              <select
                className="formSelect"
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, category: e.target.value })
                }
              >
                {Object.values(EXPENSE_CATEGORY).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="formGroup">
              <label className="formLabel">Amount (₹) *</label>
              <input
                className="formInput"
                type="number"
                step="0.01"
                min="0.01"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="formGroup">
            <label className="formLabel">Description</label>
            <input
              className="formInput"
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
              placeholder="e.g. Highway toll"
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Date</label>
            <input
              className="formInput"
              type="date"
              value={expenseForm.expense_date}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, expense_date: e.target.value })
              }
            />
          </div>
          <div className="formActions">
            <button
              type="button"
              className="secondaryBtn"
              onClick={() => setShowExpenseForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primaryBtn" disabled={submitting}>
              {submitting ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
