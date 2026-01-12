import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Save, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressService, Address, CreateAddressDto, UpdateAddressDto } from "@/services/addressService";
import { useAppointments } from "@/contexts/AppointmentContext";
import { DEFAULT_PRIMARY_COLOR, PLANS, PlanType } from "@/lib/constants";

export const AdminAddresses = () => {
  const { profile } = useAppointments();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const getToken = () => localStorage.getItem('access_token') || '';

  // Get user plan from profile
  const getUserPlan = (): PlanType => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Handle both string plan and object plan formats
      if (typeof user.plan === 'string') {
        return user.plan as PlanType;
      } else if (user.plan && typeof user.plan === 'object' && user.plan.name) {
        return user.plan.name as PlanType;
      }
      return 'demo';
    } catch {
      return 'demo';
    }
  };

  // Check if user can add more addresses
  const canAddAddress = (): { allowed: boolean; message?: string } => {
    const userPlan = getUserPlan();
    const planConfig = PLANS[userPlan];
    
    // Safety check - if plan is not found, default to demo
    if (!planConfig) {
      console.warn(`Plan "${userPlan}" not found, defaulting to demo`);
      const demoPlan = PLANS['demo'];
      // Always allow at least 1 address
      if (addresses.length === 0) {
        return { allowed: true };
      }
      if (addresses.length >= demoPlan.maxAddresses) {
        return {
          allowed: false,
          message: `Você atingiu o limite de ${demoPlan.maxAddresses} ${demoPlan.maxAddresses === 1 ? 'endereço' : 'endereços'} do plano DEMO`
        };
      }
      return { allowed: true };
    }
    
    // Always allow first address regardless of plan
    if (addresses.length === 0) {
      return { allowed: true };
    }
    
    if (planConfig.maxAddresses === 'unlimited') {
      return { allowed: true };
    }
    
    if (addresses.length >= planConfig.maxAddresses) {
      return {
        allowed: false,
        message: `Você atingiu o limite de ${planConfig.maxAddresses} ${planConfig.maxAddresses === 1 ? 'endereço' : 'endereços'} do plano ${planConfig.name.toUpperCase()}`
      };
    }
    
    return { allowed: true };
  };

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await addressService.getAddresses(token);
      setAddresses(data);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newAddress.trim()) {
      setError('Por favor, preencha o endereço');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data: CreateAddressDto = {
        address: newAddress.trim(),
      };
      await addressService.createAddress(data, token);
      setNewAddress('');
      setIsAdding(false);
      await loadAddresses();
    } catch (err) {
      console.error('Error creating address:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editAddress.trim()) {
      setError('Por favor, preencha o endereço');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data: UpdateAddressDto = {
        address: editAddress.trim(),
      };
      await addressService.updateAddress(id, data, token);
      setEditingId(null);
      setEditAddress('');
      await loadAddresses();
    } catch (err) {
      console.error('Error updating address:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (address: Address) => {
    setAddressToDelete(address);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addressService.deleteAddress(addressToDelete._id, token);
      await loadAddresses();
      setDeleteModalOpen(false);
      setAddressToDelete(null);
    } catch (err) {
      console.error('Error deleting address:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir endereço');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setAddressToDelete(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data: UpdateAddressDto = {
        isActive: !currentStatus,
      };
      await addressService.updateAddress(id, data, token);
      await loadAddresses();
    } catch (err) {
      console.error('Error toggling address status:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do endereço');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (address: Address) => {
    setEditingId(address._id);
    setEditAddress(address.address);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAddress('');
    setError(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewAddress('');
    setError(null);
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando endereços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Endereços</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Gerencie os endereços onde você atende
            </p>
          </div>
          {!isAdding && (
            <Button
              onClick={() => {
                const validation = canAddAddress();
                if (!validation.allowed) {
                  setError(validation.message || 'Limite de endereços atingido');
                  return;
                }
                setIsAdding(true);
              }}
              className="h-10 sm:h-12 px-4 sm:px-6 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
              style={{
                backgroundColor: profile.primaryColor || DEFAULT_PRIMARY_COLOR,
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Novo Endereço
            </Button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Add New Address Form */}
        {isAdding && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Novo Endereço
                </label>
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro - Fortaleza/CE"
                  className="w-full bg-white border-slate-200"
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelAdd}
                  disabled={loading}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={loading || !newAddress.trim()}
                  className="bg-primary text-white hover:bg-primary/90"
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 && !isAdding ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Nenhum endereço cadastrado</p>
            <p className="text-slate-500 text-sm">
              Adicione endereços onde você atende para gerenciar suas agendas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="p-4 rounded-lg border transition-all bg-white border-slate-200"
              >
                {editingId === address._id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <Input
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder="Ex: Rua das Flores, 123 - Centro - Fortaleza/CE"
                      className="w-full bg-white border-slate-200"
                      disabled={loading}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={loading}
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => handleUpdate(address._id)}
                        disabled={loading || !editAddress.trim()}
                        className="bg-primary text-white hover:bg-primary/90"
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          address.isActive ? 'text-primary' : 'text-slate-400'
                        }`} />
                        <div className={address.isActive ? '' : 'opacity-50'}>
                          <p className="text-slate-800 font-medium">{address.address}</p>
                          <p className="text-slate-500 text-sm mt-1">
                            {address.isActive ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(address._id, address.isActive)}
                        disabled={loading}
                        className={
                          address.isActive
                            ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }
                      >
                        {address.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(address)}
                        disabled={loading}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address)}
                        disabled={loading}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Excluir Endereço
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Tem certeza que deseja excluir este endereço?
                  </p>
                  {addressToDelete && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 font-medium">
                          {addressToDelete.address}
                        </p>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-red-600">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={cancelDelete}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
