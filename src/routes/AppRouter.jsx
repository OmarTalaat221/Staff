import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import DashboardHome from "../pages/dashboard/DashboardHome";
import StaffList from "../pages/staff/StaffList";
import Schedule from "../pages/schedule/Schedule";
import LeaveRequest from "../pages/requests/LeaveRequest";
// import CashAdvance from "../pages/requests/CashAdvance";
import Transfers from "../pages/transfers/Transfers";
// import Chat from "../pages/chat/Chat";
import Instructions from "../pages/instructions/Instructions";
import TrainingVideos from "../pages/training/TrainingVideos";
import StaffProfile from "../pages/staff/profile/StaffProfile";
import RotaList from "../pages/rota/RotaList";
import RotaDetails from "../pages/rota/RotaDetails";
import CreateRotaPage from "../pages/rota/CreateRotaPage";
import Expenses from "../pages/expenses/Expenses";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/:id" element={<StaffProfile />} />

          <Route path="/schedule" element={<Schedule />} />
          <Route path="/rota" element={<RotaList />} />
          <Route path="/rota/create" element={<CreateRotaPage />} />
          <Route path="/rota/:id" element={<RotaDetails />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/requests/leave" element={<LeaveRequest />} />
          {/* <Route path="/requests/cash-advance" element={<CashAdvance />} /> */}
          <Route path="/transfers" element={<Transfers />} />
          {/* <Route path="/chat" element={<Chat />} /> */}
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/training" element={<TrainingVideos />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
