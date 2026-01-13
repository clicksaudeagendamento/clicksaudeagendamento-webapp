
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/toaster";
import { AppointmentProvider } from "@/contexts/AppointmentContext";
import { SEO } from "@/components/SEO";
import { ProtectedWelcomeRoute } from "@/components/ProtectedWelcomeRoute";
import { LandingPage } from "@/pages/LandingPage";
import { Welcome } from "@/pages/Welcome";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { ProfessionalBooking } from "@/pages/ProfessionalBooking";
import { ProfessionalAdmin } from "@/pages/ProfessionalAdmin";
import { SystemAdmin } from "@/pages/SystemAdmin";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import AdminLoginPage from "@/pages/AdminLoginPage";

function App() {
  return (
    <HelmetProvider>
      <AppointmentProvider>
        <Router>
          <SEO />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/boas-vindas" element={
              <ProtectedWelcomeRoute>
                <Welcome />
              </ProtectedWelcomeRoute>
            } />
            <Route path="/agendamento" element={<Index />} />
            <Route path="/:userId/agendamento" element={<ProfessionalBooking />} />
            <Route path="/profissional/admin" element={<ProfessionalAdmin />} />
            <Route path="/sistema/admin" element={<SystemAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AppointmentProvider>
    </HelmetProvider>
  );
}

export default App;
