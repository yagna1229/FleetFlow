/**
 * Redux store — configureStore with all feature slices.
 */
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import vehicleReducer from "./slices/vehicleSlice";
import driverReducer from "./slices/driverSlice";
import tripReducer from "./slices/tripSlice";
import maintenanceReducer from "./slices/maintenanceSlice";
import fuelReducer from "./slices/fuelSlice";
import expenseReducer from "./slices/expenseSlice";
import analyticsReducer from "./slices/analyticsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    drivers: driverReducer,
    trips: tripReducer,
    maintenance: maintenanceReducer,
    fuel: fuelReducer,
    expenses: expenseReducer,
    analytics: analyticsReducer,
  },
});

export default store;
