
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/contexts/AppointmentContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PublicSchedule } from "@/services/scheduleService";

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  publicSchedules?: PublicSchedule[];
  loading?: boolean;
  onMonthChange?: (month: number, year: number) => void;
}

export const AppointmentCalendar = ({ onDateSelect, publicSchedules = [], loading = false, onMonthChange }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { profile } = useAppointments();

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
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

  const getScheduleStats = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const daySchedules = publicSchedules.filter(schedule => schedule.date === dateString);
    
    if (daySchedules.length === 0) return { hasSchedule: false, available: 0, busy: 0, total: 0 };
    
    const total = daySchedules.length;
    const available = daySchedules.filter(schedule => schedule.status === 'open').length;
    const busy = total - available;
    
    return { hasSchedule: true, available, busy, total };
  };

  const isDateAvailable = (date: Date) => {
    const stats = getScheduleStats(date);
    return stats.hasSchedule && stats.available > 0;
  };

  const isCurrentMonth = (date: Date, month: number) => {
    return date.getMonth() === month;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getMonth() + 1, newDate.getFullYear());
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    if (onMonthChange) {
      onMonthChange(newDate.getMonth() + 1, newDate.getFullYear());
    }
  };

  const today = new Date();
  const currentMonthDays = getCalendarDays(currentDate);

  return (
    <div className="space-y-4 sm:space-y-6">

              {/* Calendar Navigation + Grid + Legenda juntos */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-slate-200">
          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center py-4 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-slate-600">Carregando horários...</span>
            </div>
          )}
          
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
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
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

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-slate-500 py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>
        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {currentMonthDays.map((day, index) => {
            const isCurrentMonthDay = isCurrentMonth(day, currentDate.getMonth());
            const stats = getScheduleStats(day);
            const isAvailable = isDateAvailable(day);
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => isAvailable && isCurrentMonthDay && !isPast && onDateSelect(day)}
                  disabled={!isAvailable || !isCurrentMonthDay || isPast}
                  className={`w-full h-12 sm:h-16 md:h-20 rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                    isCurrentMonthDay
                      ? stats.hasSchedule
                        ? isAvailable && !isPast
                          ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100 cursor-pointer text-green-800'
                          : stats.busy > 0 && stats.available === 0
                          ? 'bg-red-50 border-2 border-red-200 text-red-800 cursor-not-allowed'
                          : 'bg-orange-50 border-2 border-orange-200 text-orange-800 cursor-not-allowed'
                        : 'text-slate-400 hover:bg-slate-50'
                      : 'text-slate-300'
                  }`}
                >
                  <span className={`text-sm sm:text-lg ${stats.hasSchedule && isCurrentMonthDay ? 'font-bold' : ''}`}>
                    {day.getDate()}
                  </span>
                  {stats.hasSchedule && isCurrentMonthDay && (
                    <div className="flex gap-1 mt-1">
                      {stats.available > 0 && (
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      )}
                      {stats.busy > 0 && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      )}
                    </div>
                  )}
                  {isPast && stats.hasSchedule && isCurrentMonthDay && (
                    <div className="absolute inset-0 bg-slate-200 opacity-50 rounded-xl" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Legenda simplificada */}
        <div className="mt-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Legenda</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Disponível</span>
                <p className="text-xs text-slate-500">Horários livres para agendamento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 border-2 border-slate-200 rounded-lg"></div>
              <div>
                <span className="text-sm font-medium text-slate-700">Sem agenda</span>
                <p className="text-xs text-slate-500">Dia não configurado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
