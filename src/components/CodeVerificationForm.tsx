import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Clock, RefreshCw } from "lucide-react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface CodeVerificationFormProps {
  phone: string;
  onVerificationSuccess: () => void;
  onBack: () => void;
}

export const CodeVerificationForm = ({ 
  phone, 
  onVerificationSuccess, 
  onBack 
}: CodeVerificationFormProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Erro",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authService.verifyCode(phone, code);
      if (response.success) {
        onVerificationSuccess();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao verificar código";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await authService.sendVerificationCode(phone);
      toast({
        title: "Sucesso",
        description: response.message,
        variant: "success",
      });
      setTimeLeft(180); // Reset timer to 3 minutes
      setCanResend(false);
      setCode(""); // Clear code input
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erro ao reenviar código";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleVerifyCode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
            Confirmar Cadastro
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600">
            Digite o código de 6 dígitos enviado via WhatsApp para o número{" "}
            <span className="font-semibold text-primary">{phone}</span>
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Código de Verificação
          </label>
          <Input
            type="text"
            value={code}
            onChange={handleCodeChange}
            onKeyPress={handleKeyPress}
            placeholder="ABC123"
            className="text-center text-2xl font-bold tracking-widest uppercase"
            maxLength={6}
            autoFocus
          />
          <p className="text-xs text-slate-500 mt-2 text-center">
            O código contém letras e números
          </p>
        </div>

        {/* Timer */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-slate-600" />
          <span className="text-sm text-slate-600">
            {canResend ? (
              "Você pode reenviar o código"
            ) : (
              <>
                Reenviar código em:{" "}
                <span className="font-semibold text-primary">
                  {formatTime(timeLeft)}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handleVerifyCode}
            disabled={code.length !== 6 || isVerifying}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {isVerifying ? "Verificando..." : "Confirmar Cadastro"}
          </Button>

          <Button
            onClick={handleResendCode}
            disabled={!canResend || isResending}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? "Reenviando..." : "Reenviar Código"}
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full"
          >
            Voltar
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Não recebeu o código?</strong>
            <br />
            • Verifique se o número de telefone está correto
            <br />
            • Aguarde alguns segundos, a mensagem pode demorar
            <br />
            • Após 3 minutos, você poderá solicitar um novo código
          </p>
        </div>
      </div>
    </div>
  );
};
