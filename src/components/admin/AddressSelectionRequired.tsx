import { MapPin, AlertCircle } from "lucide-react";

interface AddressSelectionRequiredProps {
  addressCount: number;
}

export const AddressSelectionRequired = ({ addressCount }: AddressSelectionRequiredProps) => {
  if (addressCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Nenhum endereço cadastrado
          </h3>
          <p className="text-slate-600 mb-4">
            Você precisa cadastrar pelo menos um endereço para gerenciar agendas e agendamentos.
          </p>
          <p className="text-sm text-slate-500">
            Acesse a aba <strong>Endereços</strong> para adicionar um novo local de atendimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Selecione um endereço
        </h3>
        <p className="text-slate-600">
          Para visualizar e gerenciar suas agendas e agendamentos, por favor selecione um endereço no filtro acima.
        </p>
      </div>
    </div>
  );
};
