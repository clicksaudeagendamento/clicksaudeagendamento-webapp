import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, Clock, Users, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useAppointments } from "@/contexts/AppointmentContext";
import { AdminScheduleForm } from "./AdminScheduleForm";
import { timeValidation } from "@/utils/timeValidation";
import { scheduleService, Schedule } from "@/services/scheduleService";
import { useAddressSelection } from "@/hooks/useAddressSelection";
import { AddressSelectionRequired } from "./AddressSelectionRequired";
import { DEFAULT_PRIMARY_COLOR } from "@/lib/constants";

export const AdminSchedules = () => {
  const { schedules, profile, loading, canEditSchedule, selectedAddressId } = useAppointments();
  const { shouldShowContent, requiresSelection, hasNoAddresses, addresses } = useAddressSelection();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'available' | 'busy'>('all');
  const [error, setError] = useState('');
  const [apiSchedules, setApiSchedules] = useState<Schedule[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'schedule' | 'slot' | null;
    scheduleId?: string;
    slotId?: string;
  }>({ open: false, type: null });

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('access_token') || '';
  };

  // Fetch schedules from API
  const fetchSchedulesByMonth = async (month: string) => {
    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setApiLoading(true);
    setError('');

    try {
      const schedules = await scheduleService.getSchedulesByMonth(month, token, selectedAddressId || undefined);
      setApiSchedules(schedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendas');
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch schedules when month changes or address selection changes
  useEffect(() => {
    // Only fetch if we should show content (address is selected or only one address exists)
    if (shouldShowContent && !hasNoAddresses) {
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      fetchSchedulesByMonth(month);
    }
  }, [currentDate.getMonth(), currentDate.getFullYear(), selectedAddressId, shouldShowContent, hasNoAddresses]);

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    return apiSchedules.filter(s => {
      const scheduleDate = new Date(s.dateTime);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };

  const hasSchedule = (date: Date) => {
    return getSchedulesForDate(date).length > 0;
  };

  const getScheduleStats = (date: Date) => {
    const schedules = getSchedulesForDate(date);
    if (schedules.length === 0) return { total: 0, available: 0, busy: 0 };

    const total = schedules.length;
    const available = schedules.filter(s => s.status === 'open' && !s.appointment).length;
    const busy = total - available;

    return { total, available, busy };
  };

  const isCurrentMonth = (date: Date, month: number) => {
    return date.getMonth() === month;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDeleteSchedule = async (date: Date) => {
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      // Get all schedules for the selected date
      const schedulesToDelete = getSchedulesForDate(date);
      
      if (schedulesToDelete.length === 0) {
        setError('Nenhum horário encontrado para excluir');
        return;
      }

      // Delete all individual time slots for this date
      // This will also delete any associated appointments
      const deletePromises = schedulesToDelete.map(schedule => 
        scheduleService.deleteTimeSlot(schedule._id, token)
      );

      await Promise.all(deletePromises);
      setSelectedDate(null);
      
      // Refresh the schedules after deletion
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      await fetchSchedulesByMonth(monthStr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir agenda');
    }
  };



  const handleDeleteTimeSlot = async (scheduleId: string) => {
    setError('');
    try {
      const token = getToken();
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }

      await scheduleService.deleteTimeSlot(scheduleId, token);
      // Refresh the schedules after deletion
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      await fetchSchedulesByMonth(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir horário');
    }
  };

  const selectedSchedules = selectedDate ? getSchedulesForDate(selectedDate) : [];
  const filteredSlots = selectedSchedules.filter(schedule => {
    const isAvailable = schedule.status === 'open' && !schedule.appointment;
    if (filterType === 'available') return isAvailable;
    if (filterType === 'busy') return !isAvailable;
    return true;
  });

  // Check if all schedule times are in the past
  const areAllSchedulesInPast = (schedules: Schedule[]) => {
    if (schedules.length === 0) return false;
    
    const now = new Date();
    return schedules.every(schedule => {
      const scheduleDateTime = new Date(schedule.dateTime);
      return scheduleDateTime < now;
    });
  };

  const currentMonthDays = getCalendarDays(currentDate);
  const canEdit = selectedDate ? canEditSchedule(selectedDate) : false;
  const allSchedulesInPast = selectedDate ? areAllSchedulesInPast(selectedSchedules) : false;

  // Show address selection required message if needed
  if (requiresSelection || hasNoAddresses) {
    return <AddressSelectionRequired addressCount={addresses.length} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {apiLoading && (
        <div className="flex items-center justify-center p-8">
          <Loading />
        </div>
      )}

      {/* Header with Stats */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Gestão de Agendas</h2>
            <p className="text-sm sm:text-base text-slate-600">Configure seus dias e horários disponíveis</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="h-10 sm:h-12 px-4 sm:px-6 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base"
            style={{
              backgroundColor: profile.primaryColor || DEFAULT_PRIMARY_COLOR,
              color: 'white'
            }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Nova Agenda
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">
                  {
                    apiSchedules.filter(s => {
                      const scheduleDate = new Date(s.dateTime);
                      return scheduleDate.getFullYear() === currentDate.getFullYear() &&
                        scheduleDate.getMonth() === currentDate.getMonth();
                    }).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Agendas Criadas</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">
                  {
                    apiSchedules.filter(s => {
                      const scheduleDate = new Date(s.dateTime);
                      return scheduleDate.getFullYear() === currentDate.getFullYear() &&
                        scheduleDate.getMonth() === currentDate.getMonth() &&
                        s.status === 'open';
                    }).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Horários Livres</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">
                  {
                    apiSchedules.filter(s => {
                      const scheduleDate = new Date(s.dateTime);
                      return scheduleDate.getFullYear() === currentDate.getFullYear() &&
                        scheduleDate.getMonth() === currentDate.getMonth() &&
                        s.status === 'closed';
                    }).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Agendamentos</p>
              </div>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="mt-6">
            <AdminScheduleForm
              onClose={() => setShowCreateForm(false)}
              onScheduleCreated={() => {
                // Refresh schedules after creation
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                fetchSchedulesByMonth(month);
              }}
            />
          </div>
        )}
      </div>


      {/* Calendar Navigation + Grid juntos */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        {/* Navegação do calendário */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="flex items-center gap-2 bg-white border-slate-200 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 capitalize">
            {formatMonthYear(currentDate)}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="flex items-center gap-2 bg-white border-slate-200 hover:bg-slate-50"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grid do calendário */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {currentMonthDays.map((day, index) => {
            const isCurrentMonthDay = isCurrentMonth(day, currentDate.getMonth());
            const hasScheduleForDay = hasSchedule(day);
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            const stats = getScheduleStats(day);
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => hasScheduleForDay && isCurrentMonthDay ? setSelectedDate(day) : null}
                  disabled={!hasScheduleForDay || !isCurrentMonthDay}
                  className={`w-full h-12 sm:h-16 md:h-20 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 relative ${isCurrentMonthDay
                      ? hasScheduleForDay
                        ? isSelected
                          ? 'shadow-lg transform scale-105'
                          : stats.available > 0 && stats.busy === 0
                            ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100 cursor-pointer'
                            : stats.available === 0 && stats.busy > 0
                              ? 'bg-red-50 border-2 border-red-200 hover:bg-red-100 cursor-pointer'
                              : stats.available > 0 && stats.busy > 0
                                ? 'bg-orange-50 border-2 border-orange-200 hover:bg-orange-100 cursor-pointer'
                                : 'bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-200'
                        : 'text-slate-400'
                      : 'text-slate-300'
                    }`}
                  style={isSelected ? {
                    backgroundColor: `${profile.primaryColor}20`,
                    borderColor: profile.primaryColor
                  } : {}}
                >
                  <span className={`text-sm sm:text-lg ${isSelected ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </span>
                  {hasScheduleForDay && isCurrentMonthDay && (
                    <div className="flex gap-1 mt-1">
                      {stats.available > 0 && (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full" />
                      )}
                      {stats.busy > 0 && (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                  )}
                  {isPast && hasScheduleForDay && isCurrentMonthDay && (
                    <div className="absolute inset-0 bg-slate-200 opacity-30 rounded-xl" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legenda para Admin */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Legenda</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-200 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-green-500 rounded-full" />
              </div>
              <span className="text-slate-600">Apenas livres</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-red-500 rounded-full" />
              </div>
              <span className="text-slate-600">Apenas ocupados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-50 border-2 border-orange-200 rounded flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-0.5 bg-green-500 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-red-500 rounded-full" />
                </div>
              </div>
              <span className="text-slate-600">Mistos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded" />
              <span className="text-slate-600">Sem agenda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Details */}
      {selectedDate && selectedSchedules.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 capitalize mb-1">
                {formatDate(selectedDate)}
              </h3>
              <p className="text-sm sm:text-base text-slate-600">
                {selectedSchedules.length} horário{selectedSchedules.length !== 1 ? 's' : ''} configurado{selectedSchedules.length !== 1 ? 's' : ''}
              </p>
              {allSchedulesInPast && (
                <p className="text-xs text-orange-600 mt-1">
                  Agenda não pode ser editada (data passada)
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className={`text-xs sm:text-sm ${filterType === 'all'
                  ? 'text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                style={filterType === 'all' ? { backgroundColor: profile.primaryColor } : {}}
              >
                Todos ({selectedSchedules.length})
              </Button>
              <Button
                variant={filterType === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('available')}
                className={`text-xs sm:text-sm ${filterType === 'available'
                  ? 'text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                style={filterType === 'available' ? { backgroundColor: profile.primaryColor } : {}}
              >
                Livres ({selectedSchedules.filter(s => s.status === 'open' && !s.appointment).length})
              </Button>
              <Button
                variant={filterType === 'busy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('busy')}
                className={`text-xs sm:text-sm ${filterType === 'busy'
                  ? 'text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                style={filterType === 'busy' ? { backgroundColor: profile.primaryColor } : {}}
              >
                Ocupados ({selectedSchedules.filter(s => s.status === 'closed').length})
              </Button>
            </div>

            {!allSchedulesInPast && selectedSchedules.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmModal({ open: true, type: 'schedule' })}
                disabled={loading}
                className="bg-white border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
              >
                {loading ? <Loading size="sm" /> : <Trash2 className="w-4 h-4 mr-1" />}
                Excluir Agenda
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSlots.map((schedule) => {
              const scheduleDate = new Date(schedule.dateTime);
              const time = scheduleDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const isAvailable = schedule.status === 'open' && !schedule.appointment;
              const canDeleteSlot = timeValidation.isAtLeast30MinutesFromNow(selectedDate, time);

              return (
                <div
                  key={schedule._id}
                  className={`p-3 sm:p-4 rounded-xl border transition-all relative ${isAvailable
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}
                >
                  {canDeleteSlot && (
                    <button
                      onClick={() => setConfirmModal({ open: true, type: 'slot', scheduleId: schedule._id, slotId: schedule._id })}
                      disabled={loading}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base">{time}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${isAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                      {isAvailable ? 'Livre' : 'Ocupado'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {confirmModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {confirmModal.type === 'schedule' ? 'Confirmar Exclusão da Agenda' : 'Confirmar Exclusão do Horário'}
            </h3>
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja excluir {confirmModal.type === 'schedule' ? 'esta agenda' : 'este horário'}?
              <br />
              <br />
              <b>Agendamento atrelado {confirmModal.type === 'schedule' ? 'à agenda' : 'ao horário'} também será excluído</b>
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmModal({ open: false, type: null })}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (confirmModal.type === 'schedule' && selectedDate) {
                    await handleDeleteSchedule(selectedDate);
                  } else if (confirmModal.type === 'slot' && confirmModal.scheduleId) {
                    await handleDeleteTimeSlot(confirmModal.scheduleId);
                  }
                  setConfirmModal({ open: false, type: null });
                }}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                disabled={loading}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
