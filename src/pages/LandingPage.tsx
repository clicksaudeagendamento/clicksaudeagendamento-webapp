import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { CheckCircle, Clock, Smartphone, Calendar, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";

export const LandingPage = () => {
  const { toast } = useToast();
  const [demoOpen, setDemoOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\d{11}$/.test(phone);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'email') setEmailValid(true);
    if (field === 'phone') {
      setPhoneValid(true);
      value = formatPhone(value);
    }
    const updated = { ...formData, [field]: value };
    // Checa se as senhas coincidem
    if (field === 'password' || field === 'confirmPassword') {
      setPasswordsMatch(updated.password === updated.confirmPassword);
    }
    setFormData(updated);
  };

  const isFormFilled =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.replace(/\D/g, '').length === 11 &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone.replace(/\D/g, '')) &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!validateEmail(formData.email)) {
      setEmailValid(false);
      toast({
        title: "Erro",
        description: "E-mail inválido.",
        variant: "destructive"
      });
      return;
    }
    if (!validatePhone(formData.phone.replace(/\D/g, ''))) {
      setPhoneValid(false);
      toast({
        title: "Erro",
        description: "Telefone deve conter 11 dígitos numéricos.",
        variant: "destructive"
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare payload for API
      const payload = {
        fullName: formData.name,
        phone: formData.phone.replace(/\D/g, ''), // Remove formatting for API
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword
      };

      // Call API
      await userService.registerUser(payload);

      // Success
      toast({
        title: "Cadastro realizado!",
        description: "Redirecionando para boas-vindas...",
      });
      
      // Redirect to welcome page after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/welcome';
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different error types
      let errorMessage = "Erro ao realizar cadastro. Tente novamente.";
      
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          errorMessage = "Este e-mail já está em uso.";
          setEmailValid(false);
        } else if (error.message.includes('phone')) {
          errorMessage = "Este telefone já está em uso.";
          setPhoneValid(false);
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Erro no Cadastro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left px-2">
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                Sistema de Agendamento
                <span className="block text-blue-200 mt-1 sm:mt-2">para Profissionais da Saúde</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 text-blue-100 leading-relaxed">
                Interface totalmente responsiva, lembretes automáticos via WhatsApp e gestão simplificada de consultas. Tudo em poucos cliques!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg" 
                  className="bg-white text-primary hover:bg-blue-50 text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 h-auto"
                  onClick={() => setDemoOpen(true)}
                >
                  Ver Demonstração
                </Button>
                <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                  <DialogContent className="w-full max-w-2xl bg-white p-4 sm:p-6 flex flex-col items-center" style={{ maxWidth: '95vw', maxHeight: '95vh' }}>
                    <DialogHeader>
                      <DialogTitle>Veja a Demonstração</DialogTitle>
                    </DialogHeader>
                    <div className="w-full bg-transparent flex justify-center" style={{ aspectRatio: '16/9', maxWidth: '800px', maxHeight: '60vh' }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Demonstração do Sistema"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ background: 'transparent', width: '100%', height: '100%', minHeight: 180, maxWidth: '100%', maxHeight: '100%', borderRadius: 8, display: 'block' }}
                      ></iframe>
                    </div>
                    <DialogClose asChild>
                      <Button variant="outline" className="mt-4 w-full">Fechar</Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Cadastro Form */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-6 md:p-8 text-slate-800 text-sm sm:text-base">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Cadastre-se Agora</h2>
                <p className="text-sm sm:text-base text-slate-600">5 agendamentos grátis para teste</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs sm:text-sm">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite seu nome completo"
                    className="h-10 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-xs sm:text-sm">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Digite seu e-mail"
                    className={`h-10 sm:h-12 text-sm sm:text-base ${!emailValid ? 'border-red-500' : ''}`}
                    required
                  />
                  {!emailValid && (
                    <span className="text-red-500 text-xs sm:text-sm block mt-1">E-mail inválido</span>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={`h-10 sm:h-12 text-sm sm:text-base ${!phoneValid ? 'border-red-500' : ''}`}
                    maxLength={15}
                    required
                  />
                  {!phoneValid && (
                    <span className="text-red-500 text-xs sm:text-sm block mt-1">Telefone deve conter 11 dígitos numéricos</span>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-xs sm:text-sm">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Digite sua senha"
                    className={`h-10 sm:h-12 text-sm sm:text-base ${!passwordsMatch ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme sua senha"
                    className={`h-10 sm:h-12 text-sm sm:text-base ${!passwordsMatch ? 'border-red-500' : ''}`}
                    required
                  />
                  {!passwordsMatch && (
                    <span className="text-red-500 text-xs sm:text-sm block mt-1">As senhas não coincidem</span>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 text-base sm:text-lg font-semibold"
                  disabled={!isFormFilled}
                >
                  Criar Conta e Começar Teste
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-slate-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 px-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 sm:mb-3 md:mb-4">
              Por que escolher nosso sistema?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Desenvolvido especialmente para profissionais da saúde que precisam de agilidade e praticidade no dia a dia
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">100% Responsivo</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Interface otimizada para celular, tablet e desktop. Gerencie de qualquer lugar.
              </p>
            </div>
            
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">WhatsApp Automático</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Lembretes e confirmações enviados automaticamente pelo nosso número oficial.
              </p>
            </div>
            
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">Configuração Rápida</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Em poucos cliques sua agenda está configurada e pronta para receber pacientes.
              </p>
            </div>
            
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">Gestão Inteligente</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Visualize disponibilidade, agendamentos e histórico de forma clara e organizada.
              </p>
            </div>
            
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">URL Personalizada</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Cada profissional tem sua URL única para compartilhar com pacientes.
              </p>
            </div>
            
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-lg text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3">Sem Complicação</h3>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
                Sistema pré-pago, sem cartão de crédito, sem burocracia. Simples e eficiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 px-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 sm:mb-3 md:mb-4">
              Preço Simples e Transparente
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600">
              Um valor fixo mensal. Sem surpresas, sem taxas escondidas.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto px-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-primary">
              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 mb-2">Plano Profissional</h3>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">R$ 49,90</div>
                <p className="text-sm sm:text-base text-slate-600">por mês</p>
              </div>
              
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                <li className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">Agendamentos ilimitados</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">WhatsApp automático</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">URL personalizada</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">Interface responsiva</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">Suporte técnico</span>
                </li>
                <li className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm md:text-base">5 agendamentos grátis para teste</span>
                </li>
              </ul>
              
              <Button
                className="w-full h-10 sm:h-12 text-base sm:text-lg font-semibold bg-primary text-white hover:bg-primary/90 focus:ring-0 focus:outline-none"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Começar Agora - Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Clientes e Depoimentos */}
      <section className="py-8 sm:py-20 bg-slate-50">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Profissionais da saúde que já utilizam e recomendam nosso sistema
            </p>
          </div>
          <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Depoimento 1 */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center text-sm sm:text-base">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dra. Ana Paula" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 object-cover border-4 border-primary/20" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Dra. Ana Paula</h3>
              <span className="text-primary text-xs sm:text-sm mb-1 sm:mb-2">Clínica Geral</span>
              <p className="text-slate-600 mb-2">“O sistema facilitou muito o meu dia a dia. Os lembretes automáticos reduziram faltas e meus pacientes elogiam a praticidade!”</p>
            </div>
            {/* Depoimento 2 */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center text-sm sm:text-base">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Dr. Carlos Silva" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 object-cover border-4 border-primary/20" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Dr. Carlos Silva</h3>
              <span className="text-primary text-xs sm:text-sm mb-1 sm:mb-2">Ortopedista</span>
              <p className="text-slate-600 mb-2">“A agenda online e os avisos por WhatsApp trouxeram mais organização para minha clínica. Recomendo para todos colegas!”</p>
            </div>
            {/* Depoimento 3 */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center text-center text-sm sm:text-base">
              <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Dra. Juliana Mendes" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 sm:mb-4 object-cover border-4 border-primary/20" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Dra. Juliana Mendes</h3>
              <span className="text-primary text-xs sm:text-sm mb-1 sm:mb-2">Dermatologista</span>
              <p className="text-slate-600 mb-2">“Simples, intuitivo e eficiente. Meus pacientes adoram receber lembretes e consigo gerenciar tudo pelo celular.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">ClickSaúde Agendamento</h3>
          <p className="text-slate-400">
            Sistema de agendamento profissional para área da saúde
          </p>
        </div>
      </footer>
    </div>
  );
};