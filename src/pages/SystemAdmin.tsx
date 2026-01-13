import { useState } from "react";
import { useEffect } from "react";
import { Users, BarChart3, Settings, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AdminLogin } from "@/components/admin/AdminLogin";

type SystemAdminTab = 'dashboard' | 'users' | 'whatsapp' | 'settings';

export const SystemAdmin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SystemAdminTab>('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      navigate('/login', { replace: true });
      return;
    }
    const parsedUser = JSON.parse(user);
    if (parsedUser.role !== 'admin') {
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
      case 'dashboard':
        return <SystemDashboard />;
      case 'users':
        return <UsersManagement />;
      case 'whatsapp':
        return <WhatsAppManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <SystemDashboard />;
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
            Administração do Sistema
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Painel de controle da plataforma
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-4 sm:mb-6 border border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium rounded-l-xl transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                activeTab === 'dashboard' ? 'text-white' : 'text-slate-600'
              }`} />
              <span className={`block text-xs sm:text-sm ${
                activeTab === 'dashboard' ? 'text-white' : 'text-slate-600'
              }`}>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                activeTab === 'users' ? 'text-white' : 'text-slate-600'
              }`} />
              <span className={`block text-xs sm:text-sm ${
                activeTab === 'users' ? 'text-white' : 'text-slate-600'
              }`}>Usuários</span>
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium transition-colors ${
                activeTab === 'whatsapp'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageCircle className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                activeTab === 'whatsapp' ? 'text-white' : 'text-slate-600'
              }`} />
              <span className={`block text-xs sm:text-sm ${
                activeTab === 'whatsapp' ? 'text-white' : 'text-slate-600'
              }`}>WhatsApp</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base font-medium rounded-r-xl transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${
                activeTab === 'settings' ? 'text-white' : 'text-slate-600'
              }`} />
              <span className={`block text-xs sm:text-sm ${
                activeTab === 'settings' ? 'text-white' : 'text-slate-600'
              }`}>Configurações</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

const SystemDashboard = () => {
  const specialtyData = [
    { name: 'Cardiologia', count: 15, color: '#3B82F6' },
    { name: 'Dermatologia', count: 12, color: '#059669' },
    { name: 'Pediatria', count: 18, color: '#7C3AED' },
    { name: 'Ortopedia', count: 10, color: '#DC2626' },
    { name: 'Ginecologia', count: 14, color: '#EA580C' },
    { name: 'Outros', count: 8, color: '#6B7280' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Profissionais Ativos</h3>
            <p className="text-2xl font-bold text-blue-600">127</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Agendamentos Hoje</h3>
            <p className="text-2xl font-bold text-green-600">43</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Receita Mensal</h3>
            <p className="text-2xl font-bold text-purple-600">R$ 6.350</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Profissionais por Especialidade</h3>
        <div className="space-y-4">
          {specialtyData.map((specialty) => (
            <div key={specialty.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: specialty.color }}
                />
                <span className="font-medium text-slate-700">{specialty.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full"
                    style={{ 
                      backgroundColor: specialty.color,
                      width: `${(specialty.count / 20) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-600 w-8 text-right">
                  {specialty.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsersManagement = () => {
  const users = [
    { id: 1, name: 'Dr. João Silva', specialty: 'Cardiologia', register: 'CRM-12345', email: 'joao@email.com', status: 'Ativo' },
    { id: 2, name: 'Dra. Maria Santos', specialty: 'Dermatologia', register: 'CRM-67890', email: 'maria@email.com', status: 'Ativo' },
    { id: 3, name: 'Dr. Pedro Costa', specialty: 'Pediatria', register: 'CRM-54321', email: 'pedro@email.com', status: 'Inativo' },
    { id: 4, name: 'Dra. Ana Paula', specialty: 'Ginecologia', register: 'CRM-98765', email: 'ana@email.com', status: 'Ativo' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Gestão de Usuários</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-sm font-semibold text-slate-700">Nome</th>
              <th className="pb-3 text-sm font-semibold text-slate-700">Especialidade</th>
              <th className="pb-3 text-sm font-semibold text-slate-700">Registro</th>
              <th className="pb-3 text-sm font-semibold text-slate-700">E-mail</th>
              <th className="pb-3 text-sm font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100">
                <td className="py-3 text-sm text-slate-800">{user.name}</td>
                <td className="py-3 text-sm text-slate-600">{user.specialty}</td>
                <td className="py-3 text-sm text-slate-600">{user.register}</td>
                <td className="py-3 text-sm text-slate-600">{user.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Ativo' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const WhatsAppManagement = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Gestão de WhatsApp</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">Mensagens para Profissionais</h3>
          <div className="space-y-2">
            <button className="w-full p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
              <div className="font-medium text-blue-800">Boas-vindas</div>
              <div className="text-sm text-blue-600">Mensagem de boas-vindas para novos profissionais</div>
            </button>
            <button className="w-full p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
              <div className="font-medium text-green-800">Informativos</div>
              <div className="text-sm text-green-600">Notificações sobre atualizações do sistema</div>
            </button>
            <button className="w-full p-3 text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
              <div className="font-medium text-purple-800">Metas</div>
              <div className="text-sm text-purple-600">Comemorações de metas alcançadas</div>
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">Mensagens para Pacientes</h3>
          <div className="space-y-2">
            <button className="w-full p-3 text-left bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100">
              <div className="font-medium text-orange-800">Lembretes</div>
              <div className="text-sm text-orange-600">Lembretes automáticos de consultas</div>
            </button>
            <button className="w-full p-3 text-left bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100">
              <div className="font-medium text-teal-800">Confirmações</div>
              <div className="text-sm text-teal-600">Confirmações de agendamento</div>
            </button>
            <button className="w-full p-3 text-left bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100">
              <div className="font-medium text-pink-800">Informativos</div>
              <div className="text-sm text-pink-600">Informações sobre saúde e prevenção</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SystemSettings = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
    <h2 className="text-xl font-bold text-slate-800 mb-4">Configurações do Sistema</h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Conexão WhatsApp</h3>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-green-800">WhatsApp Conectado</span>
          </div>
          <p className="text-sm text-green-600">Número: +55 11 99999-9999</p>
          <p className="text-sm text-green-600">Status: Online</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Configurações Gerais</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-700">Envio automático de lembretes</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Ativo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-700">Confirmação de agendamentos</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Ativo</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-700">Notificações para profissionais</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Ativo</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);