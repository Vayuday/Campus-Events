import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import StudentEventsPage from "./pages/student/EventsPage";
import StudentEventDetailPage from "./pages/student/EventDetailPage";
import StudentTicketsPage from "./pages/student/TicketsPage";
import StudentTicketDetailPage from "./pages/student/TicketDetailPage";
import StudentNotificationsPage from "./pages/student/NotificationsPage";
import StudentProfilePage from "./pages/student/ProfilePage";
import OrganizerEventsPage from "./pages/organizer/EventsPage";
import OrganizerParticipantsPage from "./pages/organizer/ParticipantsPage";
import OrganizerScannerPage from "./pages/organizer/ScannerPage";
import OrganizerNotifyPage from "./pages/organizer/NotifyPage";
import AdminPendingEventsPage from "./pages/admin/PendingEventsPage";
import AdminRegistrationsPage from "./pages/admin/RegistrationsPage";
import AdminReportsPage from "./pages/admin/ReportsPage";
import AdminCategoriesPage from "./pages/admin/CategoriesPage";
import AdminOverviewPage from "./pages/admin/OverviewPage";

const studentNav = [
  { to: "/student", label: "Events", icon: "·" },
  { to: "/student/tickets", label: "My Tickets", icon: "·" },
  { to: "/student/inbox", label: "Inbox", icon: "·" },
  { to: "/student/profile", label: "Profile", icon: "·" },
];

const organizerNav = [
  { to: "/organizer", label: "My Events", icon: "·" },
  { to: "/organizer/scanner", label: "Scan Tickets", icon: "·" },
  { to: "/organizer/notify", label: "Notify", icon: "·" },
];

const adminNav = [
  { to: "/admin", label: "Overview", icon: "·" },
  { to: "/admin/pending", label: "Pending Events", icon: "·" },
  { to: "/admin/registrations", label: "Registrations", icon: "·" },
  { to: "/admin/categories", label: "Categories", icon: "·" },
  { to: "/admin/reports", label: "Reports", icon: "·" },
];

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-500">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "organizer") return <Navigate to="/organizer" replace />;
  return <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route
          path="/student"
          element={<DashboardLayout title="Student" nav={studentNav} />}
        >
          <Route index element={<StudentEventsPage />} />
          <Route path="events/:id" element={<StudentEventDetailPage />} />
          <Route path="tickets" element={<StudentTicketsPage />} />
          <Route
            path="tickets/:registrationId"
            element={<StudentTicketDetailPage />}
          />
          <Route path="inbox" element={<StudentNotificationsPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["organizer", "admin"]} />}>
        <Route
          path="/organizer"
          element={
            <DashboardLayout title="Organizer" nav={organizerNav} />
          }
        >
          <Route index element={<OrganizerEventsPage />} />
          <Route
            path="events/:id/participants"
            element={<OrganizerParticipantsPage />}
          />
          <Route path="scanner" element={<OrganizerScannerPage />} />
          <Route path="notify" element={<OrganizerNotifyPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route
          path="/admin"
          element={<DashboardLayout title="Admin" nav={adminNav} />}
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="pending" element={<AdminPendingEventsPage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
