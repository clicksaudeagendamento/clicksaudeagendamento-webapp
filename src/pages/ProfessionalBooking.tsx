import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProfessionalHeader } from "@/components/ProfessionalHeader";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { TimeSlotSelection } from "@/components/TimeSlotSelection";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { useAppointments } from "@/contexts/AppointmentContext";
import { scheduleService, PublicSchedule } from "@/services/scheduleService";
import { userService, User } from "@/services/userService";
import { addressService, Address } from "@/services/addressService";
import { MapPin, Navigation } from "lucide-react";

export const ProfessionalBooking = () => {
  const { userId } = useParams<{ userId: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [personalData, setPersonalData] = useState<{
    name: string;
    phone1: string;
    phone2: string;
  } | null>(null);
  const [publicSchedules, setPublicSchedules] = useState<PublicSchedule[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [schedulesError, setSchedulesError] = useState<string | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const { profile, setProfile } = useAppointments();

  // Function to fetch public addresses
  const fetchPublicAddresses = async (userId: string) => {
    setAddressesLoading(true);
    try {
      const addressList = await addressService.getPublicAddresses(userId);
      setAddresses(addressList);
      
      // Auto-select if only one active address
      if (addressList.length === 1) {
        setSelectedAddressId(addressList[0]._id);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  // Function to fetch public schedules
  const fetchPublicSchedules = async (userId: string, month: number, year: number, addressId?: string | null) => {
    setSchedulesLoading(true);
    setSchedulesError(null);
    try {
      const schedules = await scheduleService.getPublicSchedules(userId, month, year, addressId || undefined);
      setPublicSchedules(schedules);
    } catch (error) {
      console.error('Error fetching public schedules:', error);
      setSchedulesError('Erro ao carregar horários disponíveis. Tente novamente.');
    } finally {
      setSchedulesLoading(false);
    }
  };

  // Function to fetch professional profile
  const fetchProfessionalProfile = async (userId: string) => {
    try {
      const userData = await userService.getUserProfileById(userId);
      setProfessionalProfile(userData);
      // Map User data to ProfessionalProfile format for the context
      const mappedProfile = {
        name: userData.fullName,
        specialty: userData.specialty || '',
        register: userData.registration || '',
        phone: userData.phone,
        email: userData.email,
        address: userData.address || '',
        workingHours: userData.workingHours || '',
        primaryColor: '#3B82F6', // Default color
        profileImage: userData.profileImage,
        description: userData.description || '',
        website: userData.website || '',
        instagram: userData.instagram || ''
      };
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Error fetching professional profile:', error);
      // Não define perfil se falhar
    }
  };

  useEffect(() => {
    // Carregar dados do profissional baseado no userId da URL
    if (userId) {
      fetchProfessionalProfile(userId);
      fetchPublicAddresses(userId);
    }
  }, [userId, setProfile]);

  // Fetch schedules when address selection changes
  useEffect(() => {
    if (userId && (selectedAddressId || addresses.length === 1 || addresses.length === 0)) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      fetchPublicSchedules(userId, currentMonth, currentYear, selectedAddressId);
    }
  }, [userId, selectedAddressId, addresses.length]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep(2);
  };

  const handleMonthChange = (month: number, year: number) => {
    if (userId) {
      fetchPublicSchedules(userId, month, year, selectedAddressId);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handlePersonalDataSubmit = (data: {
    name: string;
    phone1: string;
    phone2: string;
  }) => {
    setPersonalData(data);
    setCurrentStep(4);
  };

  const handleBackToCalendar = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setCurrentStep(1);
  };

  const handleBackToTimeSlots = () => {
    setSelectedTime(null);
    setCurrentStep(2);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        // Only show calendar if address is selected (or if there's only one address or no addresses)
        if (addresses.length > 1 && !selectedAddressId) {
          return null;
        }
        return (
          <AppointmentCalendar 
            onDateSelect={handleDateSelect}
            publicSchedules={publicSchedules}
            loading={schedulesLoading}
            onMonthChange={handleMonthChange}
          />
        );
      case 2:
        return (
          <TimeSlotSelection
            selectedDate={selectedDate!}
            onTimeSelect={handleTimeSelect}
            onBack={handleBackToCalendar}
            publicSchedules={publicSchedules}
          />
        );
      case 3:
        return (
          <PersonalDataForm
            selectedDate={selectedDate!}
            selectedTime={selectedTime!}
            onSubmit={handlePersonalDataSubmit}
            onBack={handleBackToTimeSlots}
            publicSchedules={publicSchedules}
            professionalPhoneNumber={professionalProfile?.phone || ""}
          />
        );
      case 4:
        const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
        return (
          <ConfirmationScreen
            appointmentData={{
              date: selectedDate!,
              time: selectedTime!,
              name: personalData!.name,
              phone1: personalData!.phone1,
              phone2: personalData!.phone2,
              address: selectedAddress?.address
            }}
          />
        );
      default:
        return null;
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">URL Inválida</h1>
          <p className="text-slate-600">O link de agendamento não foi encontrado.</p>
        </div>
      </div>
    );
  }

  if (schedulesError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Erro ao carregar horários</h1>
          <p className="text-slate-600 mb-4">{schedulesError}</p>
          <button 
            onClick={() => {
              const now = new Date();
              fetchPublicSchedules(userId, now.getMonth() + 1, now.getFullYear());
            }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <ProfessionalHeader />
        
        {/* Address Selector - Only show if multiple addresses */}
        {addresses.length > 1 && currentStep === 1 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">Selecione o local de atendimento</h3>
              </div>
              {selectedAddressId && (
                <button
                  onClick={() => {
                    const address = addresses.find(addr => addr._id === selectedAddressId);
                    if (address) {
                      const encodedAddress = encodeURIComponent(address.address);
                      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
                      window.open(googleMapsUrl, '_blank');
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Traçar rota no Google Maps"
                >
                  <Navigation className="w-4 h-4" />
                  <span className="hidden sm:inline">Como chegar? Clique aqui</span>
                </button>
              )}
            </div>
            <select
              value={selectedAddressId || ''}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-800"
              disabled={addressesLoading}
            >
              <option value="">Selecione um endereço...</option>
              {addresses.map((addr) => (
                <option key={addr._id} value={addr._id}>
                  {addr.address}
                </option>
              ))}
            </select>
            {!selectedAddressId && (
              <p className="mt-2 text-sm text-amber-600">
                Por favor, selecione um endereço para visualizar os horários disponíveis
              </p>
            )}
          </div>
        )}

        <div className="mt-6 sm:mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};