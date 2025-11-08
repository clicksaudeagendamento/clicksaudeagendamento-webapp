import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/contexts/AppointmentContext";
import { PublicSchedule } from "@/services/scheduleService";
import { format, isSameDay } from "date-fns";

interface TimeSlotProps {
  selectedDate: Date;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  publicSchedules?: PublicSchedule[];
}

export const TimeSlotSelection = ({ selectedDate, onTimeSelect, onBack, publicSchedules = [] }: TimeSlotProps) => {
  const { profile } = useAppointments();
  
  // Function to check if time slot is at least 30 minutes from now
  const isTimeSlotValid = (timeSlot: string) => {
    const now = new Date();
    const isToday = isSameDay(selectedDate, now);
    
    if (!isToday) {
      return true; // If it's not today, all times are valid
    }
    
    // Parse the time slot (format: "HH:mm")
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hours, minutes, 0, 0);
    
    // Calculate 30 minutes from now
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    return slotTime >= thirtyMinutesFromNow;
  };

  // Get available slots from public schedules for the selected date
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const daySchedules = publicSchedules.filter(schedule => schedule.date === dateString);
  const availableSlots = daySchedules
    .filter(schedule => schedule.status === 'open' && isTimeSlotValid(schedule.time))
    .map(schedule => ({
      id: schedule._id,
      time: schedule.time,
      isAvailable: true
    }));
  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Separate morning and afternoon slots
  const morningSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = availableSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12;
  });

  const renderTimeSlots = (slots: typeof availableSlots, period: string) => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
        {period}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onTimeSelect(slot.time)}
            disabled={!slot.isAvailable}
            className={`w-full p-3 rounded-lg border transition-all duration-200 ${
              slot.isAvailable
                ? 'border-primary text-primary hover:bg-slate-50 bg-white'
                : 'border-slate-200 text-slate-400 bg-white cursor-not-allowed'
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
      {slots.length === 0 && (
        <p className="text-slate-500 text-center py-4 text-sm">
          Nenhum horário disponível para este período
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header com data selecionada */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Voltar
          </Button>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 text-center capitalize mb-2">
          {formattedDate}
        </h2>
        <p className="text-center text-slate-600 text-sm sm:text-base">
          Selecione o horário de sua preferência
        </p>
      </div>

      {/* Horários da manhã */}
      {morningSlots.length > 0 && renderTimeSlots(morningSlots, 'Manhã')}

      {/* Horários da tarde */}
      {afternoonSlots.length > 0 && renderTimeSlots(afternoonSlots, 'Tarde')}
    </div>
  );
};
