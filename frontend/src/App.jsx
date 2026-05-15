import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import NewDecision from "./pages/NewDecision";
import Result from "./pages/Result";
import Outcome from "./pages/Outcome";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/questionnaire" element={
          <ProtectedRoute><Questionnaire /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/decisions/new" element={
          <ProtectedRoute><NewDecision /></ProtectedRoute>
        } />
        <Route path="/decisions/:id/result" element={
          <ProtectedRoute><Result /></ProtectedRoute>
        } />
        <Route path="/decisions/:id/outcome" element={
          <ProtectedRoute><Outcome /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
