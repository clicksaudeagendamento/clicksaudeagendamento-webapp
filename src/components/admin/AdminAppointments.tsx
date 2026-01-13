
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Phone, User, Clock, Calendar as CalendarIcon, X, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useAppointments } from "@/contexts/AppointmentContext";
import { timeValidation } from "@/utils/timeValidation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { appointmentService } from "@/services/appointmentService";
import { useAddressSelection } from "@/hooks/useAddressSelection";
import { AddressSelectionRequired } from "./AddressSelectionRequired";

export const AdminAppointments = () => {
  const { 
    schedules, 
    apiAppointments, 
    cancelAppointment, 
    profile, 
    loading, 
    apiLoading,
    canCancelAppointment,
    fetchAppointmentsByMonth,
    getAppointmentsForDate,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    fetchAddresses
  } = useAppointments();
  const { shouldShowContent, requiresSelection, hasNoAddresses } = useAddressSelection();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [error, setError] = useState('');

  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Fetch appointments when month changes or address selection changes
  useEffect(() => {
    // Only fetch if we should show content (address is selected or only one address exists)
    if (shouldShowContent && !hasNoAddresses) {
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const monthKey = `${year}-${month}`;
      
      fetchAppointmentsByMonth(month);
    }
  }, [currentDate.getMonth(), currentDate.getFullYear(), fetchAppointmentsByMonth, shouldShowContent, hasNoAddresses]);

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



  const hasAppointments = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  const getAllAppointments = () => {
    // Filter by selected address if one is selected
    let filteredAppointments = apiAppointments;
    
    if (selectedAddressId) {
      filteredAppointments = apiAppointments.filter(
        appointment => appointment.addressId === selectedAddressId
      );
    }
    
    return filteredAppointments.map(appointment => {
      const appointmentDate = new Date(appointment.scheduleDateTime);
      const time = format(appointmentDate, 'HH:mm');
      
      return {
        id: appointment._id,
        patientName: appointment.patient.name,
        patientPhone1: appointment.patient.primaryPhone,
        time: time,
        date: appointmentDate,
        scheduleId: appointment.scheduleId,
        status: appointment.status,
        addressId: appointment.addressId
      };
    }).sort((a, b) => {
      const dateA = new Date(`${a.date.toDateString()} ${a.time}`);
      const dateB = new Date(`${b.date.toDateString()} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getFilteredAppointments = () => {
    const allAppointments = getAllAppointments();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterType) {
      case 'today':
        return allAppointments.filter(apt => apt.date.toDateString() === today.toDateString());
      case 'upcoming':
        return allAppointments.filter(apt => apt.date >= today);
      case 'past':
        return allAppointments.filter(apt => apt.date < today);
      default:
        return allAppointments;
    }
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

  const handleCancelAppointment = async (appointmentId: string, date: Date, time: string) => {
    if (!canCancelAppointment(date, time)) {
      setError('Não é possível cancelar agendamentos com menos de 2 horas de antecedência');
      return;
    }

    setError('');
    try {
      const token = localStorage.getItem('access_token') || '';
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      await appointmentService.cancelAppointment(appointmentId, token);
      // Refresh appointments after cancellation
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      await fetchAppointmentsByMonth(month);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar agendamento');
    }
  };

  const selectedAppointments = selectedDate ? getAppointmentsForDate(selectedDate).map(appointment => {
    const appointmentDate = new Date(appointment.scheduleDateTime);
    const time = format(appointmentDate, 'HH:mm');
    
    return {
      id: appointment._id,
      patientName: appointment.patient.name,
      patientPhone1: appointment.patient.primaryPhone,
      time: time,
      date: appointmentDate,
      scheduleId: appointment.scheduleId,
      status: appointment.status
    };
  }) : [];
  const filteredAppointments = getFilteredAppointments();
  const currentMonthDays = getCalendarDays(currentDate);
  const today = new Date();

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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Gestão de Agendamentos</h2>
            <p className="text-sm sm:text-base text-slate-600">Visualize e gerencie todos os agendamentos</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">
                  {
                    getAllAppointments().filter(
                      apt => apt.date.getMonth() === currentDate.getMonth() && apt.date.getFullYear() === currentDate.getFullYear()
                    ).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Total</p>
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
                    getAllAppointments().filter(
                      apt =>
                        apt.date.getMonth() === currentDate.getMonth() &&
                        apt.date.getFullYear() === currentDate.getFullYear() &&
                        apt.date.toDateString() === today.toDateString()
                    ).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Hoje</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">
                  {
                    getAllAppointments().filter(
                      apt =>
                        apt.date.getMonth() === currentDate.getMonth() &&
                        apt.date.getFullYear() === currentDate.getFullYear() &&
                        apt.date >= today
                    ).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Futuros</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">
                  {
                    getAllAppointments().filter(
                      apt =>
                        apt.date.getMonth() === currentDate.getMonth() &&
                        apt.date.getFullYear() === currentDate.getFullYear() &&
                        apt.date < today
                    ).length
                  }
                </p>
                <p className="text-xs sm:text-sm text-slate-600">Passados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Calendar Grid */}
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
            const hasAppointmentsForDay = hasAppointments(day);
            const isSelected = selectedDate?.toDateString() === day.toDateString();
            const appointmentsCount = getAppointmentsForDate(day).length;
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => hasAppointmentsForDay && isCurrentMonthDay ? setSelectedDate(day) : null}
                  disabled={!hasAppointmentsForDay || !isCurrentMonthDay}
                  className={`w-full h-12 sm:h-16 md:h-20 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                    isCurrentMonthDay
                      ? hasAppointmentsForDay
                        ? isSelected
                          ? 'shadow-lg transform scale-105'
                          : isPast
                          ? 'bg-slate-100 border-2 border-slate-300 hover:bg-slate-200 cursor-pointer text-slate-600'
                          : 'bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 cursor-pointer text-blue-800'
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
                  {hasAppointmentsForDay && isCurrentMonthDay && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-slate-400' : 'bg-blue-500'}`} />
                      <span className={`text-xs font-bold ${isPast ? 'text-slate-500' : 'text-blue-600'}`}>
                        {appointmentsCount}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legenda para Agendamentos */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Legenda</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border-2 border-blue-200 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-500 rounded-full" />
              </div>
              <span className="text-slate-600">Agendamentos futuros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-100 border-2 border-slate-300 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-slate-400 rounded-full" />
              </div>
              <span className="text-slate-600">Agendamentos passados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded" />
              <span className="text-slate-600">Sem agendamentos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
          {selectedDate ? `Agendamentos de ${formatDate(selectedDate)}` : 'Todos os Agendamentos'}
        </h3>
        
        <div className="space-y-3">
          {(selectedDate ? selectedAppointments : filteredAppointments).map((appointment) => {
            const appointmentDate = selectedDate || appointment.date;
            const canCancel = canCancelAppointment(appointmentDate, appointment.time);
            const isPastAppointment = new Date(`${appointmentDate.toDateString()} ${appointment.time}`) < new Date();
            
            return (
              <div 
                key={`${appointment.scheduleId || 'unknown'}-${appointment.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isPastAppointment 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isPastAppointment ? 'bg-slate-200' : 'bg-blue-200'
                      }`}>
                        <User className={`w-4 h-4 ${isPastAppointment ? 'text-slate-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{appointment.patientName}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {format(appointmentDate, 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {(() => {
                              const phone = appointment.patientPhone1?.replace(/\D/g, '') || '';
                              if (phone.length === 13) {
                                // +xx xx xxxxx-xxxx
                                return `+${phone.slice(0,2)} ${phone.slice(2,4)} ${phone.slice(4,9)}-${phone.slice(9,13)}`;
                              }
                              if (phone.length === 12) {
                                // +xx xx xxxx-xxxx
                                return `+${phone.slice(0,2)} ${phone.slice(2,4)} ${phone.slice(4,8)}-${phone.slice(8,12)}`;
                              }
                              return profile.phone;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isPastAppointment 
                        ? 'bg-slate-200 text-slate-600' 
                        : 'bg-blue-200 text-blue-700'
                    }`}>
                      {isPastAppointment ? 'Realizado' : 'Agendado'}
                    </span>
                    
                    {canCancel && !isPastAppointment && (
                      <CancelAppointmentModal
                        onConfirm={() => handleCancelAppointment(appointment.id || '', appointmentDate, appointment.time)}
                        patientName={appointment.patientName || ''}
                        appointmentDate={appointmentDate}
                        appointmentTime={appointment.time}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {(selectedDate ? selectedAppointments : filteredAppointments).length === 0 && (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">
              {selectedDate ? 'Nenhum agendamento para esta data' : 'Nenhum agendamento encontrado'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal de Confirmação de Cancelamento
interface CancelAppointmentModalProps {
  onConfirm: () => void;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
}

const CancelAppointmentModal = ({ onConfirm, patientName, appointmentDate, appointmentTime }: CancelAppointmentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-white border-red-200 text-red-600 hover:bg-red-50"
      >
        <X className="w-4 h-4 mr-1" />
        Cancelar
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Confirmar Cancelamento
            </h3>
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja cancelar o agendamento de <strong>{patientName}</strong> para {appointmentDate.toLocaleDateString('pt-BR')} às {appointmentTime}?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Não, manter
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700"
              >
                Sim, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
