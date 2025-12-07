import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, Settings, Eye, ArrowRight, Users, Link as LinkIcon } from "lucide-react";
import { CodeVerificationForm } from "@/components/CodeVerificationForm";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showVerification, setShowVerification] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const totalSteps = 5;

  // Verifica se o usuário acabou de se registrar e precisa verificar o código
  useEffect(() => {
    const justRegistered = sessionStorage.getItem('justRegistered');
    const registeredPhone = sessionStorage.getItem('registeredPhone');
    
    if (justRegistered === 'true' && registeredPhone) {
      setUserPhone(registeredPhone);
    }
  }, []);

  // Limpa a flag de registro quando o componente é desmontado
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('justRegistered');
      sessionStorage.removeItem('registeredPhone');
    };
  }, []);

  const steps = [
    {
      id: 1,
      title: "Bem-vindo ao ClickSaúde Agendamento!",
      description: "Parabéns! Sua conta foi criada com sucesso. Agora você tem 5 agendamentos grátis para testar nossa plataforma.",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      id: 2,
      title: "Criação de Agendas",
      description: "Configure suas agendas semanais com os horários disponíveis. Defina dias da semana, horários de início e fim, e intervalos entre consultas.",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      id: 3,
      title: "Gestão de Agendamentos",
      description: "Visualize todos os agendamentos em um calendário intuitivo. Acompanhe consultas confirmadas, pendentes e histórico completo.",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      id: 4,
      title: "Configuração de Perfil",
      description: "Complete seu perfil profissional com informações como especialidade, registro profissional, endereço e horários de atendimento.",
      icon: Settings,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      id: 5,
      title: "Link Personalizado",
      description: "Após preencher seu perfil, você receberá um link personalizado para compartilhar com seus pacientes realizarem agendamentos online.",
      icon: LinkIcon,
      color: "text-pink-600",
      bgColor: "bg-pink-100"
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!userPhone) {
      toast({
        title: "Erro",
        description: "Telefone não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      await authService.sendVerificationCode(userPhone);
      setShowVerification(true);
      toast({
        title: "Sucesso",
        description: "Código enviado via WhatsApp!",
        variant: "success",
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao enviar código de verificação";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    toast({
      title: "Sucesso",
      description: "Cadastro confirmado com sucesso! Você já pode fazer login.",
      variant: "success",
    });
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  // Se precisa mostrar verificação, renderiza o componente de verificação
  if (showVerification && userPhone) {
    return (
      <CodeVerificationForm
        phone={userPhone}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={() => setShowVerification(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800">Tour da Plataforma</h1>
            <span className="text-xs sm:text-sm text-slate-600">{currentStep} de {totalSteps}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Content */}
        {currentStepData && (
          <div className="text-center mb-6 sm:mb-8">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 ${currentStepData.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
              <currentStepData.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${currentStepData.color}`} />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">
              {currentStepData.title}
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        )}

        {/* Features Preview for Steps 2-4 */}
        {currentStep >= 2 && currentStep <= 4 && (
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="text-sm sm:text-base font-semibold text-slate-800">Prévia da Funcionalidade</span>
            </div>
            
            {currentStep === 2 && (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 sm:p-3 rounded-lg border">
                  <div className="text-xs font-medium text-slate-600 mb-1">SEG</div>
                  <div className="text-xs text-green-600">8h-18h</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg border">
                  <div className="text-xs font-medium text-slate-600 mb-1">TER</div>
                  <div className="text-xs text-green-600">8h-18h</div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg border">
                  <div className="text-xs font-medium text-slate-600 mb-1">QUA</div>
                  <div className="text-xs text-slate-400">Fechado</div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-2">
                <div className="bg-white p-2 sm:p-3 rounded-lg border flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium text-slate-800 truncate">João Silva - 14:00</div>
                    <div className="text-xs text-slate-600">Consulta confirmada</div>
                  </div>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-lg border flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium text-slate-800 truncate">Maria Santos - 15:30</div>
                    <div className="text-xs text-slate-600">Consulta confirmada</div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-semibold text-slate-800 truncate">Dr. João Silva</div>
                    <div className="text-xs sm:text-sm text-primary truncate">Cardiologista - CRM 123456</div>
                    <div className="text-xs text-slate-600">(11) 99999-9999</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Special message for step 5 */}
        {currentStep === 5 && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-pink-200">
            <div className="text-center">
              <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-2">🎉 Importante!</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                Seu link personalizado só ficará ativo após você completar todas as informações do seu perfil profissional.
              </p>
              <div className="p-2 sm:p-3 bg-white rounded-lg border border-pink-200 overflow-x-auto">
                <code className="text-xs sm:text-sm text-pink-600 font-mono break-all">
                  clicksaudeagendamento.com/crm-123456/agendamento
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="bg-white border-slate-200 text-sm sm:text-base px-3 sm:px-4"
          >
            Anterior
          </Button>
          
          <div className="flex gap-1.5 sm:gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                  step.id === currentStep 
                    ? 'bg-primary' 
                    : step.id < currentStep 
                    ? 'bg-primary/50' 
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
          
          {currentStep === totalSteps ? (
            userPhone ? (
              <Button
                onClick={handleSendVerificationCode}
                className="bg-primary text-white hover:bg-primary/90 text-sm sm:text-base px-3 sm:px-4"
              >
                Confirmar Cadastro
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-primary text-white hover:bg-primary/90 text-sm sm:text-base px-3 sm:px-4"
              >
                Fazer Login
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            )
          ) : (
            <Button
              onClick={handleNext}
              className="bg-primary text-white hover:bg-primary/90 text-sm sm:text-base px-3 sm:px-4"
            >
              Próximo
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};