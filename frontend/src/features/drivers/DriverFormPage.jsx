/**
 * DriverFormPage — Create a new driver.
 */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createDriver } from "../../store/slices/driverSlice";
import { ROUTES } from "../../constants/routes";
import "../../css/shared.css";

const LICENSE_CATEGORIES = ["TRUCK", "VAN", "BIKE", "ALL"];

export default function DriverFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    license_number: "",
    license_category: "VAN",
    license_expiry: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await dispatch(createDriver(form)).unwrap();
      toast.success("Driver added successfully!");
      navigate(ROUTES.DRIVERS);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to add driver");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Add New Driver</h1>
          <p className="pageSubtitle">Register a new fleet driver</p>
        </div>
        <button
          className="secondaryBtn"
          onClick={() => navigate(ROUTES.DRIVERS)}
        >
          ← Back to List
        </button>
      </div>

      <form style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
        <div className="formRow">
          <div className="formGroup">
            <label className="formLabel">Full Name *</label>
            <input
              className="formInput"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Alex Kumar"
              required
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">Email *</label>
            <input
              className="formInput"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@fleet.com"
              required
            />
          </div>
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label className="formLabel">Phone</label>
            <input
              className="formInput"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91-XXXXX-XXXXX"
            />
          </div>
          <div className="formGroup">
            <label className="formLabel">License Number *</label>
            <input
              className="formInput"
              name="license_number"
              value={form.license_number}
              onChange={handleChange}
              placeholder="DL-XXXXXXXXXX"
              required
            />
          </div>
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label className="formLabel">License Category *</label>
            <select
              className="formSelect"
              name="license_category"
              value={form.license_category}
              onChange={handleChange}
            >
              {LICENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="formGroup">
            <label className="formLabel">License Expiry *</label>
            <input
              className="formInput"
              name="license_expiry"
              type="date"
              value={form.license_expiry}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="formActions">
          <button
            type="button"
            className="secondaryBtn"
            onClick={() => navigate(ROUTES.DRIVERS)}
          >
            Cancel
          </button>
          <button type="submit" className="primaryBtn" disabled={submitting}>
            {submitting ? "Adding..." : "Add Driver"}
          </button>
        </div>
      </form>
    </div>
  );
}
