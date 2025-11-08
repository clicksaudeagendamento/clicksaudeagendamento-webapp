import { useState } from "react";
import { ProfessionalHeader } from "@/components/ProfessionalHeader";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { TimeSlotSelection } from "@/components/TimeSlotSelection";
import { PersonalDataForm } from "@/components/PersonalDataForm";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { useAppointments } from "@/contexts/AppointmentContext";

export type AppointmentStep = 'calendar' | 'time' | 'form' | 'confirmation';

export interface AppointmentData {
  date: Date | null;
  time: string | null;
  name: string;
  phone1: string;
  phone2: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppointmentStep>('calendar');
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    date: null,
    time: null,
    name: '',
    phone1: '',
    phone2: ''
  });

  const { bookAppointment } = useAppointments();

  console.log('Current step:', currentStep);
  console.log('Appointment data:', appointmentData);

  const handleDateSelect = (date: Date) => {
    setAppointmentData(prev => ({ ...prev, date }));
    setCurrentStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setAppointmentData(prev => ({ ...prev, time }));
    setCurrentStep('form');
  };

  const handleFormSubmit = (formData: { name: string; phone1: string; phone2: string }) => {
    setAppointmentData(prev => ({ ...prev, ...formData }));
    
    // Book the appointment
    if (appointmentData.date && appointmentData.time) {
      bookAppointment(appointmentData.date, appointmentData.time, formData);
    }
    
    setCurrentStep('confirmation');
  };

  const handleBackToCalendar = () => {
    setCurrentStep('calendar');
    setAppointmentData(prev => ({ ...prev, date: null, time: null }));
  };

  const handleBackToTime = () => {
    setCurrentStep('time');
    setAppointmentData(prev => ({ ...prev, time: null }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'calendar':
        return <AppointmentCalendar onDateSelect={handleDateSelect} />;
      case 'time':
        return (
          <TimeSlotSelection
            selectedDate={appointmentData.date!}
            onTimeSelect={handleTimeSelect}
            onBack={handleBackToCalendar}
          />
        );
      case 'form':
        return (
          <PersonalDataForm
            onSubmit={handleFormSubmit}
            onBack={handleBackToTime}
            selectedDate={appointmentData.date!}
            selectedTime={appointmentData.time!}
          />
        );
      case 'confirmation':
        return <ConfirmationScreen appointmentData={appointmentData} />;
      default:
        return <AppointmentCalendar onDateSelect={handleDateSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <ProfessionalHeader />
        <div className="mt-6 sm:mt-8 animate-fade-in">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default Index;
