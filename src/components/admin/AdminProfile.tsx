
import { useState, useEffect } from "react";
import { Save, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppointments } from "@/contexts/AppointmentContext";
import { useToast } from "@/hooks/use-toast";

export const AdminProfile = () => {
  const { profile, updateProfile, updatePrimaryColor, fetchUserProfile } = useAppointments();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ ...profile, email: profile.email || '' });
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);
  const [allFilled, setAllFilled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = true;

  // Fetch user profile from API when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchUserProfile();
        setProfileLoaded(true);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Erro ao carregar perfil. Verifique sua conexão e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [fetchUserProfile]);

  // Sync formData with profile if profile changes (e.g. after cancel)
  useEffect(() => {
    setFormData(prev => ({ ...prev, ...profile, email: profile.email || prev.email || '' }));
  }, [profile]);

  // Email validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Phone validation (minimum 10 digits)
  const validatePhone = (phone: string) => {
    return /^\d{10,11}$/.test(phone);
  };

  // Phone mask (XX) XXXXX-XXXX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  };

  // Format phone from API response (e.g., "5585993857466" to "(85) 99385-7466")
  const formatPhoneFromAPI = (phone: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  // Get initials from full name
  const getInitials = (fullName: string) => {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Check if all fields are filled and valid
  useEffect(() => {
    const requiredFields = [
      formData.name,
      formData.specialty,
      formData.register,
      formData.phone,
      formData.email
    ];
    const all = requiredFields.every((v) => v && v.trim() !== '');
    setAllFilled(
      all &&
      validateEmail(formData.email) &&
      validatePhone(formData.phone.replace(/\D/g, ''))
    );

    // Check if there are changes compared to original profile
    const changed = 
      formData.name !== profile.name ||
      formData.specialty !== profile.specialty ||
      formData.register !== profile.register ||
      formData.phone !== profile.phone ||
      formData.email !== profile.email ||
      (formData.description || '') !== (profile.description || '') ||
      (formData.website || '') !== (profile.website || '') ||
      (formData.instagram || '') !== (profile.instagram || '') ||
      (formData.profileImage || '') !== (profile.profileImage || '');
    
    setHasChanges(changed);
  }, [formData, profile]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    if (field === 'email') setEmailValid(true);
    if (field === 'phone') {
      setPhoneValid(true);
      value = formatPhone(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validate before save
    if (!validateEmail(formData.email)) {
      setEmailValid(false);
      return;
    }
    if (!validatePhone(formData.phone.replace(/\D/g, ''))) {
      setPhoneValid(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(formData);
      if (formData.primaryColor !== profile.primaryColor) {
        updatePrimaryColor(formData.primaryColor);
      }
      
      // Show success toast
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
        variant: "success",
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(prev => ({ ...prev, ...profile, email: profile.email || prev.email || '' }));
    setEmailValid(true);
    setPhoneValid(true);
    setHasChanges(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">Erro ao carregar perfil</p>
          <p className="text-slate-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-slate-200">
        <div className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
              style={{ backgroundColor: formData.primaryColor }}
            >
              {formData.profileImage ? (
                <img 
                  src={formData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl sm:text-3xl">
                    {getInitials(formData.name)}
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white border-slate-200 cursor-pointer"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Camera className="w-4 h-4" />
                    Alterar Foto
                  </Button>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Appointment Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 text-center block">
              Link de Agendamento
            </label>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-slate-500 text-center">
                Compartilhe este link com seus pacientes para que eles possam visualizar suas agendas e criar agendamentos
              </p>
              
              <div className="flex items-center gap-2 w-full max-w-2xl">
                <Input
                  value={`https://www.clicksaudeagendamento.com.br/${profile.id}/agendamento`}
                  readOnly
                  className="w-full bg-slate-50 border-slate-200 h-12 text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://www.clicksaudeagendamento.com.br/${profile.id}/agendamento`);
                    toast({
                      title: "Link copiado!",
                      description: "O link foi copiado para a área de transferência.",
                      variant: "success",
                    });
                  }}
                  className="bg-white border-slate-200 h-12 px-4 whitespace-nowrap"
                >
                  Copiar Link
                </Button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Nome Completo</label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-white border-slate-200 h-12"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Especialidade</label>
              <Input
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                placeholder="Medicina do Trabalho, Cardiologia, etc."
                className="w-full bg-white border-slate-200 h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Registro (CRM, CRO, etc.)</label>
              <Input
                value={formData.register}
                onChange={(e) => handleInputChange('register', e.target.value)}
                placeholder="CRM 123456, CRO 654321, etc."
                className="w-full bg-white border-slate-200 h-12"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 91234-5678"
                className={`w-full bg-white border-slate-200 h-12 ${!phoneValid ? 'border-red-500' : ''}`}
                maxLength={15}
                required
              />
              {!phoneValid && (
                <span className="text-red-500 text-xs">Telefone deve conter no mínimo 10 dígitos numéricos</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">E-mail</label>
              <Input
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="exemplo@dominio.com"
                className={`w-full bg-white border-slate-200 h-12 ${!emailValid ? 'border-red-500' : ''}`}
                required
              />
              {!emailValid && (
                <span className="text-red-500 text-xs">E-mail inválido</span>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição Profissional</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Conte um pouco sobre você e sua experiência profissional..."
              className="w-full bg-white border-slate-200 min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Website/Página Profissional</label>
              <Input
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.seusite.com.br"
                className="w-full bg-white border-slate-200 h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Instagram</label>
              <Input
                value={formData.instagram || ''}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@seuperfil"
                className="w-full bg-white border-slate-200 h-12"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-2 mt-8">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-white border border-red-200 text-red-600 hover:bg-red-50"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="text-white bg-white border border-slate-200"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            disabled={!allFilled || !hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Atualizando...</span>
              </>
            ) : (
              <span>Atualizar</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
