import { useState, useEffect } from "react";
import { Plus, X, Calendar, Clock, Save, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { useAppointments } from "@/contexts/AppointmentContext";
import { timeValidation } from "@/utils/timeValidation";
import { scheduleService } from "@/services/scheduleService";
import { showSuccessToast, showErrorToast } from "@/lib/toast-helper";

interface AdminScheduleFormProps {
  onClose: () => void;
  onScheduleCreated?: () => void;
}

export const AdminScheduleForm = ({ onClose, onScheduleCreated }: AdminScheduleFormProps) => {
  const { profile, loading, addresses, selectedAddressId, setSelectedAddressId, fetchAddresses } = useAppointments();
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [singleDate, setSingleDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slotDuration, setSlotDuration] = useState('30');
  const [lunchBreak, setLunchBreak] = useState(false);
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [enableRecurrence, setEnableRecurrence] = useState(false);
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState(3);
  const [error, setError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<{
    name: string;
    start: string;
    end: string;
    lunch: boolean;
    lunchStart?: string;
    lunchEnd?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Get token and check user role
  const getToken = () => {
    return localStorage.getItem('access_token') || '';
  };

  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role;
    } catch {
      return null;
    }
  };

  const generateTimeSlots = (preset: { start: string; end: string; lunch: boolean; lunchStart?: string; lunchEnd?: string }, duration: number) => {
    const slots = [];
    const startTime = new Date(`2000-01-01T${preset.start}:00`);
    const endTime = new Date(`2000-01-01T${preset.end}:00`);
    
    const currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      
      // Skip lunch break if enabled in state
      if (lunchBreak) {
        const lunchStartTime = new Date(`2000-01-01T${lunchStart}:00`);
        const lunchEndTime = new Date(`2000-01-01T${lunchEnd}:00`);
        if (currentTime >= lunchStartTime && currentTime < lunchEndTime) {
          currentTime.setMinutes(currentTime.getMinutes() + duration);
          continue;
        }
      }
      
      slots.push(timeStr);
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    
    return slots;
  };

  const handleCreateSchedule = async () => {
    // Validate based on mode
    if (dateMode === 'single' && !singleDate) {
      setError('Por favor, selecione uma data');
      return;
    }
    if (dateMode === 'range' && !startDate) {
      setError('Por favor, selecione a data inicial');
      return;
    }

    // Validate address selection
    if (!selectedAddressId) {
      setError('Por favor, selecione um endereço de atendimento');
      return;
    }
    
    // Validate dates
    const dateToValidate = dateMode === 'single' ? singleDate : startDate;
    const [year, month, day] = dateToValidate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Não é possível criar agenda para datas passadas');
      return;
    }

    // Validate end date if in range mode
    if (dateMode === 'range' && endDate) {
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const endDateObj = new Date(endYear, endMonth - 1, endDay, 0, 0, 0, 0);
      
      if (endDateObj < selectedDate) {
        setError('A data final deve ser posterior à data inicial');
        return;
      }
    }

    // Validate preset selection
    if (!selectedPreset) {
      setError('Por favor, selecione um modelo de horário');
      return;
    }

    // Validate recurrence
    if (dateMode === 'single' && enableRecurrence && recurrenceOccurrences < 1) {
      setError('O número de repetições deve ser pelo menos 1');
      return;
    }

    // Check user role
    const userRole = getUserRole();
    if (userRole !== 'customer') {
      setError('Apenas profissionais podem criar agendas');
      return;
    }

    // Check token
    const token = getToken();
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    try {
      const timeSlots = generateTimeSlots(selectedPreset, parseInt(slotDuration));
      
      const payload: any = {
        timeSlots: timeSlots,
        addressId: selectedAddressId
      };

      if (dateMode === 'single') {
        const isoDate = selectedDate.toISOString();
        
        if (enableRecurrence) {
          // Use new API with recurrence
          payload.startDate = isoDate;
          payload.recurrence = {
            enabled: true,
            dayOfWeek: selectedDate.getDay(),
            occurrences: recurrenceOccurrences
          };
        } else {
          // Legacy single date mode
          payload.date = isoDate;
        }
      } else {
        // Range mode
        const startIsoDate = selectedDate.toISOString();
        payload.startDate = startIsoDate;
        
        if (endDate) {
          const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
          const endDateObj = new Date(endYear, endMonth - 1, endDay, 0, 0, 0, 0);
          payload.endDate = endDateObj.toISOString();
        }
      }
      
      await scheduleService.createSchedule(payload, token);
      
      // Show success toast
      if (dateMode === 'single' && enableRecurrence) {
        showSuccessToast(
          'Agendas criadas com sucesso!',
          `${recurrenceOccurrences} ${recurrenceOccurrences === 1 ? 'agenda criada' : 'agendas criadas'} com recorrência`
        );
      } else if (dateMode === 'range' && endDate) {
        showSuccessToast(
          'Agendas criadas com sucesso!',
          'Agendas criadas para o intervalo de dias selecionado'
        );
      } else {
        showSuccessToast(
          'Agenda criada com sucesso!',
          'Horários disponíveis para agendamento'
        );
      }
      
      onClose();
      if (onScheduleCreated) {
        onScheduleCreated();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agenda';
      setError(errorMessage);
      showErrorToast(
        'Erro ao criar agenda',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetSchedules = [
    { name: 'Meio Período (Manhã)', start: '08:00', end: '12:00', lunch: false },
    { name: 'Meio Período (Tarde)', start: '14:00', end: '18:00', lunch: false },
    { name: 'Período Integral', start: '08:00', end: '17:00', lunch: true, lunchStart: '12:00', lunchEnd: '13:00' },
    { name: 'Estendido', start: '07:00', end: '19:00', lunch: true, lunchStart: '12:00', lunchEnd: '13:00' },
  ];

  const minDate = timeValidation.getMinimumAllowedDate();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200" style={{ backgroundColor: `${profile.primaryColor}10` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: profile.primaryColor }}>
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Nova Agenda</h3>
              <p className="text-xs sm:text-sm text-slate-600">Configure os dias e horários disponíveis</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-white border-slate-200 hover:bg-slate-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Address Selection */}
        <div>
          <label className="text-sm font-semibold text-slate-800 mb-2 block flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço de Atendimento
          </label>
          {addresses.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Nenhum endereço cadastrado. Por favor, cadastre um endereço antes de criar agendas.
              </p>
            </div>
          ) : (
            <select
              value={selectedAddressId || ''}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full h-12 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Selecione um endereço</option>
              {addresses
                .filter(addr => addr.isActive)
                .map((address) => (
                  <option key={address._id} value={address._id}>
                    {address.address}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-sm font-semibold text-slate-800 mb-3 block">Modelos Rápidos</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetSchedules.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setLunchBreak(preset.lunch);
                  if (preset.lunchStart) setLunchStart(preset.lunchStart);
                  if (preset.lunchEnd) setLunchEnd(preset.lunchEnd);
                }}
                className={`p-3 text-left border rounded-lg transition-colors ${selectedPreset?.name === preset.name ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : 'border-slate-200 hover:bg-slate-50'}`}
                style={selectedPreset?.name === preset.name ? { borderColor: profile.primaryColor, backgroundColor: profile.primaryColor + '10', boxShadow: `0 0 0 2px ${profile.primaryColor}33` } : {}}
              >
                <div className="font-medium text-sm text-slate-800">{preset.name}</div>
                <div className="text-xs text-slate-500">
                  {preset.start} às {preset.end}
                  {preset.lunch && <span className="ml-2 text-slate-400">• Almoço incluído</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="text-sm font-semibold text-slate-800 mb-2 block">Tipo de Agenda</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setDateMode('single');
                setEnableRecurrence(false);
              }}
              className={`p-3 text-left border rounded-lg transition-colors ${
                dateMode === 'single'
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              style={
                dateMode === 'single'
                  ? {
                      borderColor: profile.primaryColor,
                      backgroundColor: profile.primaryColor + '10',
                      boxShadow: `0 0 0 2px ${profile.primaryColor}33`,
                    }
                  : {}
              }
            >
              <div className="font-medium text-sm text-slate-800">Dia Único</div>
              <div className="text-xs text-slate-500">Criar agenda para um dia específico</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setDateMode('range');
                setEnableRecurrence(false);
              }}
              className={`p-3 text-left border rounded-lg transition-colors ${
                dateMode === 'range'
                  ? 'border-primary ring-2 ring-primary/30 bg-primary/10'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
              style={
                dateMode === 'range'
                  ? {
                      borderColor: profile.primaryColor,
                      backgroundColor: profile.primaryColor + '10',
                      boxShadow: `0 0 0 2px ${profile.primaryColor}33`,
                    }
                  : {}
              }
            >
              <div className="font-medium text-sm text-slate-800">Intervalo de Dias</div>
              <div className="text-xs text-slate-500">Criar agenda para vários dias</div>
            </button>
          </div>

          {dateMode === 'single' ? (
            <>
              <label className="text-sm font-semibold text-slate-800 mb-2 block">Data</label>
              <Input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full"
                min={minDate}
              />
              <p className="text-xs text-slate-500 mt-1">
                Agendas podem ser criadas a partir de hoje ({new Date().toLocaleDateString('pt-BR')})
              </p>

              {/* Recurrence Option for Single Date */}
              <div className="mt-4 bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="enableRecurrence"
                    checked={enableRecurrence}
                    onChange={(e) => setEnableRecurrence(e.target.checked)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: profile.primaryColor }}
                  />
                  <label htmlFor="enableRecurrence" className="text-sm font-semibold text-slate-800">
                    Repetir esta agenda semanalmente
                  </label>
                </div>

                {enableRecurrence && singleDate && (
                  <div>
                    <label className="text-xs text-slate-600 mb-2 block">
                      Repetir por quantas semanas? (incluindo a primeira)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="52"
                      value={recurrenceOccurrences}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        setRecurrenceOccurrences(Math.min(Math.max(value, 1), 52));
                      }}
                      className="w-full"
                      placeholder="Número de semanas"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {(() => {
                        const [year, month, day] = singleDate.split('-').map(Number);
                        const baseDate = new Date(year, month - 1, day);
                        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                        const dayName = dayNames[baseDate.getDay()];
                        
                        if (recurrenceOccurrences === 1) {
                          return `Esta agenda será criada apenas para ${dayName}, ${baseDate.toLocaleDateString('pt-BR')}`;
                        }
                        
                        const lastDate = new Date(baseDate);
                        lastDate.setDate(lastDate.getDate() + (recurrenceOccurrences - 1) * 7);
                        
                        return `Esta agenda será criada para ${recurrenceOccurrences} ${dayName}s seguidas, de ${baseDate.toLocaleDateString('pt-BR')} até ${lastDate.toLocaleDateString('pt-BR')}`;
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-800 mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                  min={minDate}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-800 mb-2 block">Data Final (Opcional)</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                  min={startDate || minDate}
                />
              </div>
              {startDate && (
                <p className="text-xs text-slate-500 col-span-full">
                  {endDate
                    ? `Agendas serão criadas para todos os dias entre ${new Date(startDate).toLocaleDateString('pt-BR')} e ${new Date(endDate).toLocaleDateString('pt-BR')}`
                    : `Agenda será criada apenas para ${new Date(startDate).toLocaleDateString('pt-BR')}`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Slot Duration */}
        <div>
          <label className="text-sm font-semibold text-slate-800 mb-2 block">Duração por Consulta</label>
          <select
            value={slotDuration}
            onChange={(e) => setSlotDuration(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="15">15 minutos</option>
            <option value="20">20 minutos</option>
            <option value="30">30 minutos</option>
            <option value="45">45 minutos</option>
            <option value="60">60 minutos</option>
          </select>
        </div>

        {/* Lunch Break */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="lunchBreak"
              checked={lunchBreak}
              onChange={(e) => setLunchBreak(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: profile.primaryColor }}
            />
            <label htmlFor="lunchBreak" className="text-sm font-semibold text-slate-800">
              Intervalo para Almoço
            </label>
          </div>
          
          {lunchBreak && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Início do intervalo</label>
                <Input
                  type="time"
                  value={lunchStart}
                  onChange={(e) => setLunchStart(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Fim do intervalo</label>
                <Input
                  type="time"
                  value={lunchEnd}
                  onChange={(e) => setLunchEnd(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {((dateMode === 'single' && singleDate) || (dateMode === 'range' && startDate)) && selectedPreset && (
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-2">Prévia dos Horários</h4>
            <div className="flex flex-wrap gap-1">
              {generateTimeSlots(selectedPreset, parseInt(slotDuration)).slice(0, 8).map((time) => (
                <span
                  key={time}
                  className="px-2 py-1 text-xs rounded-md text-white"
                  style={{ backgroundColor: profile.primaryColor }}
                >
                  {time}
                </span>
              ))}
              {generateTimeSlots(selectedPreset, parseInt(slotDuration)).length > 8 && (
                <span className="px-2 py-1 text-xs text-slate-500">
                  +{generateTimeSlots(selectedPreset, parseInt(slotDuration)).length - 8} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleCreateSchedule}
            disabled={
              (!singleDate && !startDate) ||
              !selectedAddressId ||
              !selectedPreset ||
              isSubmitting ||
              addresses.length === 0
            }
            className="flex-1 h-12 font-semibold text-sm sm:text-base"
            style={{ 
              backgroundColor: profile.primaryColor,
              color: 'white'
            }}
          >
            {isSubmitting ? (
              <Loading size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Criar Agenda
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 h-12 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 text-sm sm:text-base"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
