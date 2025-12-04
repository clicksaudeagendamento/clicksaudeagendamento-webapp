"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/services/userService"
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  MessageCircle,
  Shield,
  Smartphone,
  Star,
  Zap,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export const LandingPage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [demoOpen, setDemoOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [emailValid, setEmailValid] = useState(true)
  const [phoneValid, setPhoneValid] = useState(true)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePhone = (phone: string) => {
    return /^\d{11}$/.test(phone)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === "email") setEmailValid(true)
    if (field === "phone") {
      setPhoneValid(true)
      value = formatPhone(value)
    }
    const updated = { ...formData, [field]: value }
    if (field === "password" || field === "confirmPassword") {
      setPasswordsMatch(updated.password === updated.confirmPassword)
    }
    setFormData(updated)
  }

  const isFormFilled =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.phone.replace(/\D/g, "").length === 11 &&
    formData.password.trim() !== "" &&
    formData.confirmPassword.trim() !== "" &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone.replace(/\D/g, "")) &&
    formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(formData.email)) {
      setEmailValid(false)
      toast({
        title: "Erro",
        description: "E-mail inválido.",
        variant: "destructive",
      })
      return
    }
    if (!validatePhone(formData.phone.replace(/\D/g, ""))) {
      setPhoneValid(false)
      toast({
        title: "Erro",
        description: "Telefone deve conter 11 dígitos numéricos.",
        variant: "destructive",
      })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false)
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      })
      return
    }

    try {
      const payload = {
        fullName: formData.name,
        phone: formData.phone.replace(/\D/g, ""),
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.confirmPassword,
      }

      await userService.registerUser(payload)

      // Define a flag no sessionStorage indicando que o usuário acabou de se cadastrar
      sessionStorage.setItem('justRegistered', 'true')

      toast({
        title: "Cadastro realizado!",
        description: "Redirecionando para boas-vindas...",
        variant: "success",
      })

      setTimeout(() => {
        navigate('/boas-vindas')
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)

      let errorMessage = "Erro ao realizar cadastro. Tente novamente."

      if (error instanceof Error) {
        if (error.message.includes("email")) {
          errorMessage = "Este e-mail já está em uso."
          setEmailValid(false)
        } else if (error.message.includes("phone")) {
          errorMessage = "Este telefone já está em uso."
          setPhoneValid(false)
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Erro no Cadastro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">🎁 Ganhe 50 Agendamentos GRÁTIS</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                Sistema de Agendamento
                <span className="block text-blue-200 mt-2">para Profissionais da Saúde</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-4 text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Design inteligente e adaptável, gestão completa de atendimentos e lembretes automáticos via WhatsApp
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-5 mb-6 border border-white/20 shadow-xl max-w-2xl mx-auto lg:mx-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-left">
                      <span className="font-bold text-white">Planos Pré-Pagos</span> - Zero burocracia, você escolhe o
                      que precisa
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-left">
                      <span className="font-bold text-white">Múltiplos Endereços</span> - Gerencie agendas de diferentes
                      locais
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-left">
                      <span className="font-bold text-white">Para Todos os Perfis</span> - Do iniciante ao grande
                      consultório
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">500+</div>
                  <div className="text-xs text-blue-200">Profissionais</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">15k+</div>
                  <div className="text-xs text-blue-200">Agendamentos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold">98%</div>
                  <div className="text-xs text-blue-200">Satisfação</div>
                </div>
              </div>

              {/* <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start max-w-md mx-auto lg:mx-0 lg:max-w-none">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-blue-50 text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  onClick={() => setDemoOpen(true)}
                >
                  Ver Demonstração
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                  <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl bg-white p-4 sm:p-6 flex flex-col items-center mx-auto">
                    <DialogHeader>
                      <DialogTitle className="text-base sm:text-lg">Veja a Demonstração</DialogTitle>
                    </DialogHeader>
                    <div className="w-full bg-transparent flex justify-center" style={{ aspectRatio: "16/9" }}>
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        title="Demonstração do Sistema"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                    <DialogClose asChild>
                      <Button variant="outline" className="mt-4 w-full bg-transparent">
                        Fechar
                      </Button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div> */}
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 text-slate-800 border-t-4 border-primary max-w-md mx-auto lg:max-w-none w-full">
              <div className="text-center mb-5 sm:mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-full mb-3">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Cadastre-se Agora</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Após usar seus <span className="font-bold text-primary">50 agendamentos gratuitos</span>, escolha o{" "}
                  <span className="font-bold text-green-600">plano ideal</span> para você.
                  <span className="block mt-1 font-semibold text-slate-800">
                    Cancele quando quiser, sem multa ou burocracia
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium block mb-1.5">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Digite seu nome"
                    className="h-11 sm:h-12 text-sm sm:text-base border-slate-300 focus:border-primary w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium block mb-1.5">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Digite seu e-mail"
                    className={`h-11 sm:h-12 text-sm sm:text-base border-slate-300 focus:border-primary w-full ${!emailValid ? "border-red-500" : ""}`}
                    required
                  />
                  {!emailValid && <span className="text-red-500 text-xs sm:text-sm block mt-1.5">E-mail inválido</span>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium block mb-1.5">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={`h-11 sm:h-12 text-sm sm:text-base border-slate-300 focus:border-primary w-full ${!phoneValid ? "border-red-500" : ""}`}
                    maxLength={15}
                    required
                  />
                  {!phoneValid && (
                    <span className="text-red-500 text-xs sm:text-sm block mt-1.5">
                      Telefone deve conter 11 dígitos numéricos
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium block mb-1.5">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Digite sua senha"
                    className={`h-11 sm:h-12 text-sm sm:text-base border-slate-300 focus:border-primary w-full ${!passwordsMatch ? "border-red-500" : ""}`}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium block mb-1.5">
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirme sua senha"
                    className={`h-11 sm:h-12 text-sm sm:text-base border-slate-300 focus:border-primary w-full ${!passwordsMatch ? "border-red-500" : ""}`}
                    required
                  />
                  {!passwordsMatch && (
                    <span className="text-red-500 text-xs sm:text-sm block mt-1.5">As senhas não coincidem</span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-sm sm:text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                  disabled={!isFormFilled}
                >
                  Criar Conta e Solicitar Teste Grátis
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 pt-2">
                  <Shield className="w-4 h-4" />
                  <span>Seus dados estão seguros conosco</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">Como Funciona?</h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Apenas 3 passos simples para começar a usar
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="relative text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <span className="text-3xl sm:text-4xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800">Cadastre-se Grátis</h3>
              <p className="text-sm sm:text-base text-slate-600">
                Preencha o formulário rápido e solicite acesso ao sistema
              </p>
              <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
            </div>

            <div className="relative text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors duration-300">
                <span className="text-3xl sm:text-4xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800">Configure sua Agenda</h3>
              <p className="text-sm sm:text-base text-slate-600">
                Defina horários, locais de atendimento e personalize sua agenda em minutos
              </p>
              <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-green-500/50 to-transparent"></div>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                <span className="text-3xl sm:text-4xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800">Receba Agendamentos</h3>
              <p className="text-sm sm:text-base text-slate-600">
                Compartilhe seu link para agendamentos e gerencie consultas facilmente
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              Por que escolher nosso sistema?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Desenvolvido especialmente para profissionais da saúde que precisam de agilidade e praticidade no dia a
              dia
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-red-200 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 group-hover:scale-110 transition-all duration-300">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Sem Complicação</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Sistema pré-pago, sem cartão de crédito, sem burocracia. Simples e eficiente.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-purple-200 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 group-hover:scale-110 transition-all duration-300">
                <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Gestão Inteligente</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Visualize disponibilidade, agendamentos e histórico de forma clara e organizada.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-blue-200 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 group-hover:scale-110 transition-all duration-300">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">URL Personalizada</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Cada profissional tem sua URL única para compartilhar com pacientes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">Configuração Rápida</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Em poucos cliques sua agenda está configurada e pronta para receber pacientes.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-200 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300">
                <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">WhatsApp Automático</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Lembretes e confirmações enviados automaticamente pelo nosso número oficial.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-lg text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-3">100% Responsivo</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Interface otimizada para celular, tablet e desktop. Gerencie de qualquer lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Profissionais da saúde que já utilizam e recomendam nosso sistema
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="bg-slate-50 rounded-xl shadow-lg p-5 sm:p-6 flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Dr. Carlos Silva"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-primary/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">Dr. Carlos Silva</h3>
                  <span className="text-primary text-xs sm:text-sm">Ortopedista</span>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed flex-1">
                "A agenda online e os avisos por WhatsApp trouxeram mais organização para minha clínica. Recomendo para
                todos colegas!"
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl shadow-lg p-5 sm:p-6 flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/65.jpg"
                  alt="Dra. Juliana Mendes"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-primary/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">Dra. Juliana Mendes</h3>
                  <span className="text-primary text-xs sm:text-sm">Dermatologista</span>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed flex-1">
                "Simples, intuitivo e eficiente. Meus pacientes adoram receber lembretes e consigo gerenciar tudo pelo
                celular."
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl shadow-lg p-5 sm:p-6 flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Dra. Ana Paula"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-primary/20 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">Dra. Ana Paula</h3>
                  <span className="text-primary text-xs sm:text-sm">Clínica Geral</span>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed flex-1">
                "O sistema facilitou muito o meu dia a dia. Os lembretes automáticos reduziram faltas e meus pacientes
                elogiam a praticidade!"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-4">
              Planos
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600">
              Selecione o plano ideal para o seu volume de atendimentos e mantenha sua agenda sempre organizada
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {/* ClickSaúde One */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full mb-3">
                  <span className="text-2xl sm:text-3xl">🩺</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ClickSaúde One</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">
                  A solução ideal para quem atende sozinho e quer organizar a agenda sem complicação
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">R$ 69</div>
                <p className="text-sm text-slate-600">por mês</p>
              </div>

              <ul className="space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Até 150 agendamentos/mês</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Lembretes automáticos via WhatsApp</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Gestão completa da sua agenda</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">1 endereço de atendimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Suporte dedicado</span>
                </li>
              </ul>

              <p className="text-sm italic text-slate-600 mb-4 text-center">Simples, eficiente e feito para o seu dia a dia</p>
            </div>

            {/* ClickSaúde Pro */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-primary relative overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 md:scale-105">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                Mais Popular
              </div>

              <div className="text-center mb-6 mt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full mb-3">
                  <span className="text-2xl sm:text-3xl">⚕️</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ClickSaúde Pro</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">
                  Para profissionais que atendem em vários locais e precisam de mais capacidade
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">R$ 99</div>
                <p className="text-sm text-slate-600">por mês</p>
              </div>

              <ul className="space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">300 agendamentos/mês</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Lembretes via WhatsApp</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Gestão de agenda e pacientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Até 3 endereços de atendimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Suporte prioritário</span>
                </li>
              </ul>

              <p className="text-sm italic text-slate-600 mb-4 text-center">Mais flexibilidade para quem não para de crescer</p>
            </div>

            {/* ClickSaúde Prime */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full mb-3">
                  <span className="text-2xl sm:text-3xl">🏥</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ClickSaúde Prime</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">
                  Para profissionais com alta demanda e atuação em múltiplos espaços de saúde
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">R$ 139</div>
                <p className="text-sm text-slate-600">por mês</p>
              </div>

              <ul className="space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Agendamentos ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Lembretes ilimitados via WhatsApp</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Gestão completa da agenda</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Endereços ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Suporte premium</span>
                </li>
              </ul>

              <p className="text-sm italic text-slate-600 mb-4 text-center">Máxima liberdade para expandir seus atendimentos</p>
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-500 mt-8">
            *Cancele quando quiser, sem multa ou burocracia
          </p>
        </div>
      </section>

      <footer className="bg-slate-800 text-white py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-xs sm:text-sm text-slate-400">
            <p>© 2025 ClickSaúde Agendamento. Todos os direitos reservados.</p>
            <p>CNPJ: 39.578.523/0001-55</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
