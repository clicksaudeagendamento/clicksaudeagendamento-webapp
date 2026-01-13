import { useState } from "react";
import { useEffect, useCallback } from "react";
import { Users, BarChart3, Settings, MessageCircle, Edit, Trash2, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { adminDashboardService, DashboardMetrics, SpecialtyDistribution } from "@/services/adminDashboardService";
import { userService, User } from "@/services/userService";
import { PLANS, type PlanType } from "@/lib/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, specialtiesData] = await Promise.all([
          adminDashboardService.getMetrics(),
          adminDashboardService.getSpecialtiesDistribution()
        ]);
        setMetrics(metricsData);
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setError('Erro ao carregar os dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Carregando dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Nenhum dado encontrado</div>
      </div>
    );
  }

  // Gera cores dinamicamente para as especialidades
  const colors = ['#3B82F6', '#059669', '#7C3AED', '#DC2626', '#EA580C', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899'];
  const specialtyData = specialties.map((specialty, index) => ({
    name: specialty.specialty,
    count: specialty.count,
    percentage: specialty.percentage,
    color: colors[index % colors.length]
  }));

  const maxCount = Math.max(...specialties.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Profissionais Ativos</h3>
            <p className="text-2xl font-bold text-blue-600">{metrics.activeProfessionals}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Agendamentos Hoje</h3>
            <p className="text-2xl font-bold text-green-600">{metrics.todayAppointments}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800">Receita Mensal</h3>
            <p className="text-2xl font-bold text-purple-600">
              R$ {metrics.monthlyRevenue.toLocaleString('pt-BR', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Profissionais por Especialidade</h3>
        {specialtyData.length > 0 ? (
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
                        width: `${(specialty.count / maxCount) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 w-8 text-right">
                    {specialty.count}
                  </span>
                  <span className="text-xs text-slate-500 w-12 text-right">
                    ({specialty.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            Nenhuma especialidade encontrada
          </div>
        )}
      </div>
    </div>
  );
};

const UsersManagement = () => {
  const ITEMS_PER_PAGE = 10;
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<{
    accepted: boolean;
    plan: PlanType;
  }>({ accepted: true, plan: 'demo' });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getToken = () => localStorage.getItem('access_token') || '';

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const usersData = await userService.getAllUsers(token);
      // Filter only customers (professionals)
      const customers = usersData.filter(user => user.role === 'customer');
      setUsers(customers);
      setFilteredUsers(customers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar os usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, users]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditData({
      accepted: user.accepted,
      plan: (typeof user.plan === 'string' ? user.plan : user.plan?.name || 'demo') as PlanType
    });
    setEditModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdating(true);
      const token = getToken();
      await userService.updateUserById(selectedUser._id, {
        accepted: editData.accepted,
        plan: editData.plan
      }, token);
      
      setEditModalOpen(false);
      setSelectedUser(null);
      await fetchUsers(); // Reload users
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao atualizar usuário. Tente novamente.');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      setDeleting(true);
      const token = getToken();
      await userService.removeUser(selectedUser._id, token);
      
      setDeleteModalOpen(false);
      setSelectedUser(null);
      
      // Adjust current page if needed after deletion
      const newFilteredUsers = filteredUsers.filter(user => user._id !== selectedUser._id);
      const newTotalPages = Math.ceil(newFilteredUsers.length / ITEMS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      
      await fetchUsers(); // Reload users
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError('Erro ao excluir usuário. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const formatPlanName = (plan: string | { name: string } | null | undefined): string => {
    if (typeof plan === 'string') {
      return PLANS[plan as PlanType]?.name.toUpperCase() || plan.toUpperCase();
    }
    if (plan && typeof plan === 'object' && plan.name) {
      return plan.name.toUpperCase();
    }
    return 'DEMO';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Carregando usuários...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-2">{error}</div>
            <Button onClick={fetchUsers} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Gestão de Usuários</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        {currentUsers.length === 0 && !loading ? (
          <div className="text-center py-8 text-slate-500">
            {searchTerm ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário encontrado'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 text-sm font-semibold text-slate-700">Nome</th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">E-mail</th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">Especialidade</th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">Plano</th>
                    <th className="pb-3 text-sm font-semibold text-slate-700">Status</th>
                    <th className="pb-3 text-sm font-semibold text-slate-700 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 text-sm text-slate-800 font-medium">{user.fullName}</td>
                      <td className="py-3 text-sm text-slate-600">{user.email}</td>
                      <td className="py-3 text-sm text-slate-600">{user.specialty || '-'}</td>
                      <td className="py-3 text-sm text-slate-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {formatPlanName(user.plan)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.accepted 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {user.accepted ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="h-8 w-8 p-0 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(user)}
                            className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuários
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (totalPages <= 7) {
                        // Show all pages if 7 or fewer
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      } else {
                        // Show ellipsis logic for more than 7 pages
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => goToPage(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="text-slate-500 px-1">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="text-sm sm:text-base font-medium text-slate-700 block break-words leading-relaxed">
                    Usuário: {selectedUser.fullName}
                  </label>
                  <label className="text-xs sm:text-sm text-slate-500 block mt-1 break-words">
                    E-mail: {selectedUser.email}
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-slate-700 block">
                  Status
                </label>
                <div className="w-full">
                  <Select 
                    value={editData.accepted ? 'ativo' : 'inativo'} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, accepted: value === 'ativo' }))}
                  >
                    <SelectTrigger className="w-full min-h-[44px] text-sm sm:text-base">
                      <SelectValue className="break-words" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[200px]">
                      <SelectItem value="ativo" className="text-sm sm:text-base">Ativo</SelectItem>
                      <SelectItem value="inativo" className="text-sm sm:text-base">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-medium text-slate-700 block">
                  Plano
                </label>
                <div className="w-full">
                  <Select 
                    value={editData.plan} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, plan: value as PlanType }))}
                  >
                    <SelectTrigger className="w-full min-h-[44px] text-sm sm:text-base">
                      <SelectValue className="break-words" />
                    </SelectTrigger>
                    <SelectContent className="w-full min-w-[220px] max-w-[90vw]">
                      <SelectItem value="demo" className="text-sm sm:text-base py-2">Demo (Gratuito)</SelectItem>
                      <SelectItem value="basic" className="text-sm sm:text-base py-2">Básico (R$ 67/mês)</SelectItem>
                      <SelectItem value="professional" className="text-sm sm:text-base py-2">Profissional (R$ 99/mês)</SelectItem>
                      <SelectItem value="enterprise" className="text-sm sm:text-base py-2">Empresarial (R$ 159/mês)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditModalOpen(false)}
              disabled={updating}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              {updating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o usuário <strong>{selectedUser?.fullName}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleting}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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