/**
 * TripDetailPage — trip lifecycle view with dispatch/complete/cancel actions.
 * Shows detailed trip info including assigned vehicle and driver.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { apiGet } from "../../api/client";
import {
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from "../../store/slices/tripSlice";
import StatusPill from "../../components/StatusPill";
import Modal from "../../components/Modal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { ROUTES } from "../../constants/routes";
import { formatNumber, formatDateTime } from "../../utils/formatters";
import "../../css/trips.css";
import "../../css/shared.css";

const LIFECYCLE = ["DRAFT", "DISPATCHED", "COMPLETED"];

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useSelector((s) => s.auth);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDispatch, setShowDispatch] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [odometer, setOdometer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setTrip(await apiGet(`/api/v1/trips/${id}`));
    } catch {
      toast.error("Trip not found");
      navigate(ROUTES.TRIPS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDispatch = async () => {
    setSubmitting(true);
    try {
      await dispatch(
        dispatchTrip({
          id: parseInt(id),
          data: { start_odometer: parseFloat(odometer) },
        }),
      ).unwrap();
      toast.success("Trip dispatched! Driver status changed to ON_TRIP.");
      setShowDispatch(false);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Dispatch failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await dispatch(
        completeTrip({
          id: parseInt(id),
          data: { end_odometer: parseFloat(odometer) },
        }),
      ).unwrap();
      toast.success(
        "Trip completed! Driver & vehicle released back to AVAILABLE.",
      );
      setShowComplete(false);
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Completion failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this trip?")) return;
    try {
      await dispatch(cancelTrip(parseInt(id))).unwrap();
      toast.success("Trip cancelled");
      load();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Cancel failed");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!trip) return null;

  const stepClass = (step) => {
    const steps = LIFECYCLE;
    const currentIdx = steps.indexOf(trip.status);
    const stepIdx = steps.indexOf(step);
    if (trip.status === "CANCELLED") return "tripStep";
    if (stepIdx < currentIdx) return "tripStep tripStepDone";
    if (stepIdx === currentIdx) return "tripStep tripStepActive";
    return "tripStep";
  };

  return (
    <div className="tripWrap">
      {/* ── Header ── */}
      <div className="pageHeader">
        <div>
          <button
            className="secondaryBtn"
            onClick={() => navigate(ROUTES.TRIPS)}
            style={{
              marginBottom: 12,
              fontSize: "0.85rem",
              padding: "6px 14px",
            }}
          >
            ← Back to Trips
          </button>
          <h1 className="pageTitle">Trip #{trip.id}</h1>
          <p className="pageSubtitle">
            {trip.origin} → {trip.destination}
          </p>
        </div>
      </div>

      {/* ── Lifecycle indicator ── */}
      <div className="tripLifecycle">
        {LIFECYCLE.map((step, i) => (
          <span key={step}>
            {i > 0 && <span className="tripArrow"> → </span>}
            <span className={stepClass(step)}>{step}</span>
          </span>
        ))}
        {trip.status === "CANCELLED" && (
          <>
            <span className="tripArrow"> — </span>
            <span
              className="tripStep"
              style={{
                background: "rgba(239,68,68,0.08)",
                borderColor: "rgba(239,68,68,0.3)",
                color: "#dc2626",
              }}
            >
              CANCELLED
            </span>
          </>
        )}
      </div>

      {/* ── Trip Info grid ── */}
      <div className="dashSection">
        <h2 className="dashSectionTitle">Trip Information</h2>
        <div className="tripInfoGrid">
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Status</div>
            <div className="tripInfoValue">
              <StatusPill status={trip.status} />
            </div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Origin</div>
            <div className="tripInfoValue">{trip.origin}</div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Destination</div>
            <div className="tripInfoValue">{trip.destination}</div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Cargo Weight</div>
            <div className="tripInfoValue">
              {formatNumber(trip.cargo_weight_kg)} kg
            </div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Cargo Description</div>
            <div className="tripInfoValue">{trip.cargo_description || "—"}</div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Start Odometer</div>
            <div className="tripInfoValue">
              {trip.start_odometer
                ? `${formatNumber(trip.start_odometer)} km`
                : "—"}
            </div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">End Odometer</div>
            <div className="tripInfoValue">
              {trip.end_odometer
                ? `${formatNumber(trip.end_odometer)} km`
                : "—"}
            </div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Dispatched At</div>
            <div className="tripInfoValue">
              {formatDateTime(trip.dispatched_at)}
            </div>
          </div>
          <div className="tripInfoCard">
            <div className="tripInfoLabel">Completed At</div>
            <div className="tripInfoValue">
              {formatDateTime(trip.completed_at)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Assigned Vehicle ── */}
      {trip.vehicle && (
        <div className="dashSection">
          <h2 className="dashSectionTitle">🚛 Assigned Vehicle</h2>
          <div className="tripInfoGrid">
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Vehicle</div>
              <div className="tripInfoValue">
                {trip.vehicle.make} {trip.vehicle.model}
              </div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Registration</div>
              <div className="tripInfoValue">
                {trip.vehicle.registration_number}
              </div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Type</div>
              <div className="tripInfoValue">{trip.vehicle.vehicle_type}</div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Vehicle Status</div>
              <div className="tripInfoValue">
                <StatusPill status={trip.vehicle.status} />
              </div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Capacity</div>
              <div className="tripInfoValue">
                {formatNumber(trip.vehicle.max_capacity_kg)} kg
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Assigned Driver ── */}
      {trip.driver && (
        <div className="dashSection">
          <h2 className="dashSectionTitle">👤 Assigned Driver</h2>
          <div className="tripInfoGrid">
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Driver Name</div>
              <div className="tripInfoValue">{trip.driver.full_name}</div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Email</div>
              <div className="tripInfoValue">{trip.driver.email}</div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">License</div>
              <div className="tripInfoValue">
                {trip.driver.license_number} ({trip.driver.license_category})
              </div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Driver Status</div>
              <div className="tripInfoValue">
                <StatusPill status={trip.driver.status} />
              </div>
            </div>
            <div className="tripInfoCard">
              <div className="tripInfoLabel">Safety Score</div>
              <div className="tripInfoValue">
                {Number(trip.driver.safety_score)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      {["manager", "dispatcher"].includes(role) && (
        <div className="tripActions">
          {trip.status === "DRAFT" && (
            <>
              <button
                className="primaryBtn"
                onClick={() => {
                  setOdometer("");
                  setShowDispatch(true);
                }}
              >
                🚀 Dispatch Trip
              </button>
              <button className="dangerBtn" onClick={handleCancel}>
                Cancel Trip
              </button>
            </>
          )}
          {trip.status === "DISPATCHED" && (
            <>
              <button
                className="primaryBtn"
                onClick={() => {
                  setOdometer("");
                  setShowComplete(true);
                }}
              >
                ✅ Complete Trip
              </button>
              <button className="dangerBtn" onClick={handleCancel}>
                Cancel Trip
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Dispatch modal ── */}
      <Modal
        isOpen={showDispatch}
        onClose={() => setShowDispatch(false)}
        title="Dispatch Trip"
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          Dispatching will set the driver and vehicle status to{" "}
          <strong>ON_TRIP</strong>.
        </p>
        <div className="formGroup">
          <label className="formLabel">Start Odometer (km) *</label>
          <input
            className="formInput"
            type="number"
            step="0.01"
            min="0"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="Current odometer reading"
            required
          />
        </div>
        <div className="formActions">
          <button
            className="secondaryBtn"
            onClick={() => setShowDispatch(false)}
          >
            Cancel
          </button>
          <button
            className="primaryBtn"
            disabled={!odometer || submitting}
            onClick={handleDispatch}
          >
            {submitting ? "Dispatching..." : "Confirm Dispatch"}
          </button>
        </div>
      </Modal>

      {/* ── Complete modal ── */}
      <Modal
        isOpen={showComplete}
        onClose={() => setShowComplete(false)}
        title="Complete Trip"
      >
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          Completing will release the driver and vehicle back to{" "}
          <strong>AVAILABLE</strong>.
        </p>
        <div className="formGroup">
          <label className="formLabel">End Odometer (km) *</label>
          <input
            className="formInput"
            type="number"
            step="0.01"
            min="0"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="Final odometer reading"
            required
          />
        </div>
        <div className="formActions">
          <button
            className="secondaryBtn"
            onClick={() => setShowComplete(false)}
          >
            Cancel
          </button>
          <button
            className="primaryBtn"
            disabled={!odometer || submitting}
            onClick={handleComplete}
          >
            {submitting ? "Completing..." : "Confirm Completion"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
