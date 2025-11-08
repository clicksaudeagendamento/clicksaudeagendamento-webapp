import { useState } from "react";
import { useEffect } from "react";
import { Calendar, Clock, User, ArrowLeft, Settings, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AdminSchedules } from "@/components/admin/AdminSchedules";
import { AdminAppointments } from "@/components/admin/AdminAppointments";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminLogin } from "@/components/admin/AdminLogin";

type AdminTab = 'schedules' | 'appointments' | 'profile';

export const ProfessionalAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('schedules');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login', { replace: true });
      return;
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'customer') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedules':
        return <AdminSchedules />;
      case 'appointments':
        return <AdminAppointments />;
      case 'profile':
        return <AdminProfile />;
      default:
        return <AdminSchedules />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-200">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="flex-1"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              Sair
            </Button>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Painel do Profissional
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Gerencie suas agendas, agendamentos e perfil profissional
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-6 border border-slate-200">
          <div className="grid grid-cols-3">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium rounded-l-xl transition-colors ${
                activeTab === 'schedules'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
              <span className="block text-xs sm:text-sm">Agendas</span>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'appointments'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
              <span className="block text-xs sm:text-sm">Agendamentos</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium rounded-r-xl transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
              <span className="block text-xs sm:text-sm">Perfil</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};