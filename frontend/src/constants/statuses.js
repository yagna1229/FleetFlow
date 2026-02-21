/**
 * Status enums — mirror of backend Python enums.
 */
export const VEHICLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  IN_SHOP: "IN_SHOP",
  RETIRED: "RETIRED",
};

export const VEHICLE_TYPE = {
  TRUCK: "TRUCK",
  VAN: "VAN",
  BIKE: "BIKE",
};

export const DRIVER_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  OFF_DUTY: "OFF_DUTY",
  SUSPENDED: "SUSPENDED",
};

export const TRIP_STATUS = {
  DRAFT: "DRAFT",
  DISPATCHED: "DISPATCHED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const EXPENSE_CATEGORY = {
  TOLL: "TOLL",
  PARKING: "PARKING",
  PENALTY: "PENALTY",
  OTHER: "OTHER",
};

/**
 * Status → display color mappings for StatusPill component.
 */
export const STATUS_COLORS = {
  AVAILABLE: {
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.3)",
    text: "#34d399",
  },
  ON_TRIP: {
    bg: "rgba(79, 124, 255, 0.14)",
    border: "rgba(79, 124, 255, 0.3)",
    text: "#93b4ff",
  },
  IN_SHOP: {
    bg: "rgba(251, 191, 36, 0.14)",
    border: "rgba(251, 191, 36, 0.3)",
    text: "#fbbf24",
  },
  RETIRED: {
    bg: "rgba(107, 114, 128, 0.14)",
    border: "rgba(107, 114, 128, 0.3)",
    text: "#9ca3af",
  },
  OFF_DUTY: {
    bg: "rgba(107, 114, 128, 0.14)",
    border: "rgba(107, 114, 128, 0.3)",
    text: "#9ca3af",
  },
  SUSPENDED: {
    bg: "rgba(239, 68, 68, 0.14)",
    border: "rgba(239, 68, 68, 0.3)",
    text: "#f87171",
  },
  DRAFT: {
    bg: "rgba(107, 114, 128, 0.14)",
    border: "rgba(107, 114, 128, 0.3)",
    text: "#9ca3af",
  },
  DISPATCHED: {
    bg: "rgba(79, 124, 255, 0.14)",
    border: "rgba(79, 124, 255, 0.3)",
    text: "#93b4ff",
  },
  COMPLETED: {
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.3)",
    text: "#34d399",
  },
  CANCELLED: {
    bg: "rgba(239, 68, 68, 0.14)",
    border: "rgba(239, 68, 68, 0.3)",
    text: "#f87171",
  },
};
