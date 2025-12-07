import { useState } from "react";
import { ChevronLeft, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppointments } from "@/contexts/AppointmentContext";
import { appointmentService, CreateAppointmentPayload } from "@/services/appointmentService";
import { PublicSchedule } from "@/services/scheduleService";
import { format } from "date-fns";

interface PersonalDataFormProps {
  onSubmit: (data: { name: string; phone1: string; phone2: string }) => void;
  onBack: () => void;
  selectedDate: Date;
  selectedTime: string;
  publicSchedules?: PublicSchedule[];
  professionalPhoneNumber?: string;
}

export const PersonalDataForm = ({ onSubmit, onBack, selectedDate, selectedTime, publicSchedules = [], professionalPhoneNumber }: PersonalDataFormProps) => {
  const { profile } = useAppointments();
  const [formData, setFormData] = useState({
    name: '',
    phone1: '',
    phone2: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.phone1.trim()) {
      newErrors.phone1 = 'Telefone principal é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone1)) {
      newErrors.phone1 = 'Formato inválido. Use: (11) 99999-9999';
    }

    if (formData.phone2.trim() && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone2)) {
      newErrors.phone2 = 'Formato inválido. Use: (11) 99999-9999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    // Limitar a 11 dígitos (2 do DDD + 9 do número)
    if (numbers.length > 11) {
      return formData.phone1 || formData.phone2; // Retorna valor anterior se exceder
    }
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, -4)}-${numbers.slice(-4)}`;
    }
    
    return value;
  };

  const handlePhoneChange = (field: 'phone1' | 'phone2', value: string) => {
    const formatted = formatPhone(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const createAppointment = async (patientData: { name: string; phone1: string; phone2: string }) => {
    if (!professionalPhoneNumber) {
      throw new Error('Número do profissional não encontrado');
    }

    // Find the schedule for the selected date and time
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const selectedSchedule = publicSchedules.find(schedule => 
      schedule.date === dateString && 
      schedule.time === selectedTime && 
      schedule.status === 'open'
    );

    if (!selectedSchedule) {
      throw new Error('Horário não disponível');
    }

    // Format phone number for API (remove formatting and add country code if needed)
    const formatPhoneForAPI = (phone: string) => {
      const digits = phone.replace(/\D/g, '');
      // If it doesn't start with 55, add it
      return digits.startsWith('55') ? digits : `55${digits}`;
    };

    const payload: CreateAppointmentPayload = {
      schedule: selectedSchedule._id,
      patientName: patientData.name,
      primaryPhone: formatPhoneForAPI(patientData.phone1)
    };

    return await appointmentService.createAppointment(payload);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await createAppointment(formData);
        onSubmit(formData);
      } catch (error) {
        console.error('Error creating appointment:', error);
        setSubmitError(error instanceof Error ? error.message : 'Erro ao criar agendamento. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header com resumo do agendamento */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
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
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 text-center mb-4">
          Dados Pessoais
        </h2>
        <div className="rounded-lg p-3 sm:p-4 text-center bg-slate-50">
          <p className="capitalize font-medium text-sm sm:text-base text-slate-700">
            {formattedDate}
          </p>
          <p className="text-lg font-semibold text-slate-800">
            {selectedTime}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Nome completo */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-slate-700 font-medium text-sm sm:text-base">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Digite seu nome completo"
              className={`bg-white border-slate-200 text-sm sm:text-base h-12 ${
                errors.name ? 'border-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.name}</p>
            )}
          </div>

          {/* Telefone principal */}
          <div className="space-y-2">
            <Label htmlFor="phone1" className="flex items-center gap-2 text-slate-700 font-medium text-sm sm:text-base">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              Telefone Principal *
            </Label>
            <Input
              id="phone1"
              type="tel"
              value={formData.phone1}
              onChange={(e) => handlePhoneChange('phone1', e.target.value)}
              placeholder="(11) 99999-9999"
              className={`bg-white border-slate-200 text-sm sm:text-base h-12 ${
                errors.phone1 ? 'border-red-500' : ''
              }`}
              maxLength={15}
            />
            {errors.phone1 && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.phone1}</p>
            )}
          </div>

          {/* Telefone alternativo */}
          <div className="space-y-2">
            <Label htmlFor="phone2" className="flex items-center gap-2 text-slate-700 font-medium text-sm sm:text-base">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
              Telefone Alternativo (opcional)
            </Label>
            <Input
              id="phone2"
              type="tel"
              value={formData.phone2}
              onChange={(e) => handlePhoneChange('phone2', e.target.value)}
              placeholder="(11) 99999-9999"
              className={`bg-white border-slate-200 text-sm sm:text-base h-12 ${
                errors.phone2 ? 'border-red-500' : ''
              }`}
              maxLength={15}
            />
            {errors.phone2 && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.phone2}</p>
            )}
          </div>

          {/* Error message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Botão de confirmação */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{ 
              backgroundColor: profile.primaryColor,
              color: 'white'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:h-5 border-b-2 border-white mr-2"></div>
                Criando agendamento...
              </>
            ) : (
              <>Criar Agendamento</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
