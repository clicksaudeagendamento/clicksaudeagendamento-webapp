
import { User, MapPin, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/contexts/AppointmentContext";

export const ProfessionalHeader = () => {
  const navigate = useNavigate();
  const { profile } = useAppointments();

  // Function to generate initials from name
  const generateInitials = (fullName: string): string => {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleImageClick = () => {
    navigate('/admin');
  };

  const handleAddressClick = () => {
    const encodedAddress = encodeURIComponent(profile.address);
    const googleMapsUrl = `https://maps.google.com/?q=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handlePhoneClick = () => {
    const phone = profile.phone?.replace(/\D/g, '') || '';
    const whatsappUrl = `https://wa.me/55${phone}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-200">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Foto/Logo do Profissional - Clicável */}
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${profile.primaryColor}CC, ${profile.primaryColor})` 
          }}
          // onClick={handleImageClick}
        >
          <span className="text-white font-bold text-2xl sm:text-3xl md:text-4xl">
            {generateInitials(profile.name)}
          </span>
        </div>
        
        {/* Informações do Profissional */}
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-2 break-words">
            {profile.name.toUpperCase()}
          </h1>
          {profile.specialty && profile.register && (
            <p className="text-base sm:text-lg mb-3 sm:mb-4" style={{ color: profile.primaryColor }}>
              {profile.specialty} - {profile.register}
            </p>
          )}
          
          <div className="space-y-2 text-xs sm:text-sm text-slate-600">
            {profile.address && (
              <div 
                className="flex items-center justify-center sm:justify-start gap-2 flex-wrap cursor-pointer hover:opacity-80 transition-opacity group"
                onClick={handleAddressClick}
                title="Clique para abrir no Google Maps"
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: profile.primaryColor }} />
                <span className="break-words text-blue-600 hover:underline">{profile.address}</span>
              </div>
            )}
            <div 
              className="flex items-center justify-center sm:justify-start gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
              onClick={handlePhoneClick}
              title="Clique para conversar no WhatsApp"
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 group-hover:scale-110 transition-transform" style={{ color: profile.primaryColor }} />
              <span className="text-blue-600 hover:underline">
                {(() => {
                  const phone = profile.phone?.replace(/\D/g, '') || '';

                  if (phone.length === 11) {
                    // (XX) XXXXX-XXXX
                    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7, 11)}`;
                  }

                  if (phone.length === 10) {
                    // (XX) XXXX-XXXX
                    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6, 10)}`;
                  }

                  return profile.phone; // fallback (não formatado)
                })()}
              </span>
            </div>
            {profile.workingHours && (
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: profile.primaryColor }} />
                <span>{profile.workingHours}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mensagem de Boas-vindas */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border-l-4" 
           style={{ 
             backgroundColor: `${profile.primaryColor}10`, 
             borderColor: profile.primaryColor 
           }}>
        <p className="text-center sm:text-left text-sm sm:text-base" 
           style={{ color: profile.primaryColor }}>
          Agende sua consulta de forma rápida e prática. Selecione o dia e horário de sua preferência.
        </p>
      </div>
    </div>
  );
};
