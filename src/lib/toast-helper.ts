import { toast } from "@/hooks/use-toast";

/**
 * Exibe um toast de sucesso com fundo verde transparente
 * @param title - Título do toast
 * @param description - Descrição opcional do toast
 */
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "success",
  });
};

/**
 * Exibe um toast de erro com fundo vermelho transparente
 * @param title - Título do toast
 * @param description - Descrição opcional do toast
 */
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

/**
 * Exibe um toast padrão
 * @param title - Título do toast
 * @param description - Descrição opcional do toast
 */
export const showToast = (title: string, description?: string) => {
  toast({
    title,
    description,
  });
};
