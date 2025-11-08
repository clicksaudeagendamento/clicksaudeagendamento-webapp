
import { CheckCircle, Calendar, Clock, User, Phone, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentData } from "@/pages/Index";
import { useAppointments } from "@/contexts/AppointmentContext";

interface ConfirmationScreenProps {
  appointmentData: AppointmentData;
}

export const ConfirmationScreen = ({ appointmentData }: ConfirmationScreenProps) => {
  const { profile } = useAppointments();
  
  const formattedDate = appointmentData.date?.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleNewAppointment = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">
        {/* Success Header */}
        <div className="text-center pt-4 sm:pt-8 pb-2 sm:pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full mb-4 sm:mb-6 shadow-lg" style={{ backgroundColor: `${profile.primaryColor}20` }}>
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" style={{ color: profile.primaryColor }} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2 sm:mb-3">
            Agendamento Criado! 🎉
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-1 sm:mb-2">
            Muito obrigado por escolher nossos serviços
          </p>
          <p className="text-sm sm:text-base text-slate-500">
            Estamos ansiosos para recebê-lo(a)
          </p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-l-4" style={{ borderLeftColor: profile.primaryColor }}>
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">
              Detalhes do seu agendamento
            </h2>
            <div className="h-1 w-16 sm:w-20 mx-auto rounded-full" style={{ backgroundColor: profile.primaryColor }}></div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${profile.primaryColor}20` }}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: profile.primaryColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-500">Data</p>
                <p className="font-semibold text-sm sm:text-base text-slate-800 capitalize truncate">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${profile.primaryColor}20` }}>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: profile.primaryColor }} />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500">Horário</p>
                <p className="font-semibold text-sm sm:text-base text-slate-800">{appointmentData.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${profile.primaryColor}20` }}>
                <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: profile.primaryColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-500">Paciente</p>
                <p className="font-semibold text-sm sm:text-base text-slate-800 truncate">{appointmentData.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${profile.primaryColor}20` }}>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: profile.primaryColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-500">Contato</p>
                <p className="font-semibold text-sm sm:text-base text-slate-800 break-all">{appointmentData.phone1}</p>
                {appointmentData.phone2 && (
                  <p className="text-xs sm:text-sm text-slate-600 break-all">{appointmentData.phone2}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${profile.primaryColor}20` }}>
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: profile.primaryColor }} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2 sm:mb-3">
              Seja muito bem-vindo(a)! 
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
              Cuidar da sua saúde é nossa prioridade. Estamos preparados para oferecer o melhor atendimento para você.
            </p>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: profile.primaryColor }} />
            Informações Importantes
          </h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" style={{ backgroundColor: profile.primaryColor }}></div>
              <div>
                <p className="font-medium text-sm sm:text-base text-slate-800">Confirmação do Agendamento</p>
                <p className="text-xs sm:text-sm text-slate-600">Você receberá uma confirmação via WhatsApp ou telefone próximo à data.</p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" style={{ backgroundColor: profile.primaryColor }}></div>
              <div>
                <p className="font-medium text-sm sm:text-base text-slate-800">Pontualidade</p>
                <p className="text-xs sm:text-sm text-slate-600">Chegue com 15 minutos de antecedência para facilitar o atendimento.</p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" style={{ backgroundColor: profile.primaryColor }}></div>
              <div>
                <p className="font-medium text-sm sm:text-base text-slate-800">Documentos Necessários</p>
                <p className="text-xs sm:text-sm text-slate-600">Traga documento com foto e carteirinha do convênio (se aplicável).</p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0" style={{ backgroundColor: profile.primaryColor }}></div>
              <div>
                <p className="font-medium text-sm sm:text-base text-slate-800">Cancelamentos</p>
                <p className="text-xs sm:text-sm text-slate-600">Para cancelar, entre em contato com pelo menos 24h de antecedência.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pb-4 sm:pb-8">
          <Button
            onClick={handleNewAppointment}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02]"
            style={{ 
              backgroundColor: profile.primaryColor,
              color: 'white'
            }}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Fazer Novo Agendamento
          </Button>
        </div>
      </div>
    </div>
  );
};
