import { configureStore } from "@reduxjs/toolkit";
import expenseReducer from "./slices/expenseSlice";

export const store = configureStore({
  reducer: {
    expense: expenseReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
