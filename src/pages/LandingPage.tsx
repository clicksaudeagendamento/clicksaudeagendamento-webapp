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
  TrendingUp,
  Users,
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
    // Aceita 10 dígitos (sem 9º dígito) ou 11 dígitos (com 9º dígito)
    return /^\d{10,11}$/.test(phone)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 2) return digits
    
    // Formato para 10 dígitos: (85) 9285-0222
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    
    // Formato para 11 dígitos: (85) 99285-0222
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
    formData.phone.replace(/\D/g, "").length >= 10 &&
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
        description: "Telefone deve conter 10 ou 11 dígitos numéricos.",
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

      // Armazena o telefone do usuário para o processo de verificação
      sessionStorage.setItem('justRegistered', 'true')
      sessionStorage.setItem('registeredPhone', formData.phone.replace(/\D/g, ''))

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
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8F9FFF 0%, #7A8EFF 50%, #6B7EF5 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/40 to-yellow-400/40 backdrop-blur-sm px-4 py-2.5 rounded-full border border-amber-300/60 shadow-xl animate-bounce">
                <Zap className="w-5 h-5 text-amber-900" />
                <span className="text-sm font-bold text-amber-950">🎁 Ganhe 50 Agendamentos GRÁTIS</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-balance text-white">
                  Transforme sua Agenda em Resultados
                </h1>

                <p className="text-base sm:text-lg md:text-xl mb-6 text-white leading-relaxed max-w-2xl mx-auto lg:mx-0 text-pretty">
                  O sistema de agendamento mais completo para profissionais da saúde que querem crescer com organização
                  e inteligência
                </p>
              </div>

              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-2xl max-w-2xl mx-auto lg:mx-0">
                <div className="grid sm:grid-cols-3 gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <CheckCircle className="w-5 h-5 text-emerald-900" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Sem Burocracia</p>
                      <p className="text-xs text-white/90">Planos pré-pagos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <MessageCircle className="w-5 h-5 text-cyan-900" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">WhatsApp Auto</p>
                      <p className="text-xs text-white/90">Lembretes inteligentes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-fuchsia-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <TrendingUp className="w-5 h-5 text-fuchsia-900" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Multi-locais</p>
                      <p className="text-xs text-white/90">Gestão completa</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 pt-4">
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-5 h-5 text-white/90" />
                    <div className="text-3xl font-bold text-white">500+</div>
                  </div>
                  <div className="text-xs text-white/90">Profissionais Ativos</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-5 h-5 text-white/90" />
                    <div className="text-3xl font-bold text-white">15k+</div>
                  </div>
                  <div className="text-xs text-white/90">Agendamentos</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-white/90" />
                    <div className="text-3xl font-bold text-white">98%</div>
                  </div>
                  <div className="text-xs text-white/90">Satisfação</div>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 border-t-4 max-w-md mx-auto lg:max-w-none w-full transform hover:shadow-3xl transition-shadow duration-300"
              style={{ borderTopColor: "#8F9FFF" }}
            >
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #8F9FFF 0%, #7A8EFF 100%)" }}
                >
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold mb-3 bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #8F9FFF 0%, #6B7EF5 100%)" }}
                >
                  Comece Grátis Agora
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-bold" style={{ color: "#8F9FFF" }}>
                    50 agendamentos gratuitos
                  </span>{" "}
                  para você conhecer o sistema
                  <span className="block mt-2 text-xs text-slate-500">
                    ✓ Sem cartão de crédito • ✓ Cancele quando quiser
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold block mb-2 text-slate-700">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Dr(a). Seu Nome"
                    className="h-12 text-base border-slate-300 w-full transition-all"
                    style={
                      {
                        "--tw-ring-color": "#8F9FFF33",
                      } as React.CSSProperties
                    }
                    onFocus={(e) => {
                      e.target.style.borderColor = "#8F9FFF"
                      e.target.style.boxShadow = "0 0 0 3px rgba(143, 159, 255, 0.2)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = ""
                      e.target.style.boxShadow = ""
                    }}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold block mb-2 text-slate-700">
                    E-mail Profissional
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="seu@email.com"
                    className={`h-12 text-base border-slate-300 w-full transition-all ${!emailValid ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                    onFocus={(e) => {
                      if (emailValid) {
                        e.target.style.borderColor = "#8F9FFF"
                        e.target.style.boxShadow = "0 0 0 3px rgba(143, 159, 255, 0.2)"
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = ""
                      e.target.style.boxShadow = ""
                    }}
                    required
                  />
                  {!emailValid && (
                    <span className="text-red-500 text-sm block mt-1.5 flex items-center gap-1">⚠️ E-mail inválido</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold block mb-2 text-slate-700">
                    WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={`h-12 text-base border-slate-300 w-full transition-all ${!phoneValid ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                    maxLength={15}
                    onFocus={(e) => {
                      if (phoneValid) {
                        e.target.style.borderColor = "#8F9FFF"
                        e.target.style.boxShadow = "0 0 0 3px rgba(143, 159, 255, 0.2)"
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = ""
                      e.target.style.boxShadow = ""
                    }}
                    required
                  />
                  {!phoneValid && (
                    <span className="text-red-500 text-sm block mt-1.5 flex items-center gap-1">
                      ⚠️ Telefone deve conter 10 ou 11 dígitos
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold block mb-2 text-slate-700">
                      Senha
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="••••••••"
                      className={`h-12 text-base border-slate-300 w-full transition-all ${!passwordsMatch ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                      onFocus={(e) => {
                        if (passwordsMatch) {
                          e.target.style.borderColor = "#8F9FFF"
                          e.target.style.boxShadow = "0 0 0 3px rgba(143, 159, 255, 0.2)"
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = ""
                        e.target.style.boxShadow = ""
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold block mb-2 text-slate-700">
                      Confirmar
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="••••••••"
                      className={`h-12 text-base border-slate-300 w-full transition-all ${!passwordsMatch ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                      onFocus={(e) => {
                        if (passwordsMatch) {
                          e.target.style.borderColor = "#8F9FFF"
                          e.target.style.boxShadow = "0 0 0 3px rgba(143, 159, 255, 0.2)"
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = ""
                        e.target.style.boxShadow = ""
                      }}
                      required
                    />
                  </div>
                </div>
                {!passwordsMatch && (
                  <span className="text-red-500 text-sm block flex items-center gap-1">⚠️ As senhas não coincidem</span>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group text-white"
                  style={{
                    background: "linear-gradient(135deg, #8F9FFF 0%, #7A8EFF 100%)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #7A8EFF 0%, #6B7EF5 100%)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #8F9FFF 0%, #7A8EFF 100%)"
                  }}
                  disabled={!isFormFilled}
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Seus dados estão 100% seguros</span>
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
            {/* ClickSaúde Basic */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full mb-3">
                  <span className="text-2xl sm:text-3xl">🩺</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ClickSaúde Basic</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">
                  Organização sem complicação para quem está começando no digital 💛
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">R$ 69</div>
                <p className="text-sm text-slate-600">por mês</p>
              </div>

              <ul className="space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Até 80 agendamentos/mês</span>
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
                  <span className="text-sm sm:text-base">1 endereço de atendimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Suporte dedicado</span>
                </li>
              </ul>

              <p className="text-sm italic text-slate-600 mb-4 text-center">Simples, eficiente e feito para o seu dia a dia</p>
            </div>

            {/* ClickSaúde Professional */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border-2 border-primary relative overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 md:scale-105">
              <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                Mais Popular
              </div>

              <div className="text-center mb-6 mt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full mb-3">
                  <span className="text-2xl sm:text-3xl">⚕️</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ClickSaúde Professional</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">
                  Mais flexibilidade, mais consultas e mais crescimento 🚀
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">R$ 99</div>
                <p className="text-sm text-slate-600">por mês</p>
              </div>

              <ul className="space-y-3 mb-6 sm:mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Até 120 agendamentos/mês</span>
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

            {/* ClickSaúde Enterprise */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 rounded-full mb-3">
                  <span className="text-2xl sm:text-3xl">🏥</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">ClickSaúde Enterprise</h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-4">
                  Performance máxima para quem precisa de total liberdade ⚡
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">R$ 159</div>
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
                  <span className="text-sm sm:text-base">Gestão de agenda e pacientes</span>
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

              <p className="text-sm italic text-slate-600 mb-4 text-center">Para profissionais com grande demanda e presença em múltiplos serviços</p>
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
