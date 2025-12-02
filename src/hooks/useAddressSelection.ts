import { useAppointments } from "@/contexts/AppointmentContext";

/**
 * Custom hook to check if content should be displayed based on address selection
 * Returns true if:
 * - There are no addresses (show empty state)
 * - There is exactly 1 address (auto-selected)
 * - There are multiple addresses and one is selected
 */
export const useAddressSelection = () => {
  const { addresses, selectedAddressId } = useAppointments();

  const shouldShowContent = 
    addresses.length === 0 || // No addresses - show empty state
    addresses.length === 1 || // Single address - auto-selected
    (addresses.length > 1 && selectedAddressId !== null); // Multiple addresses with selection

  const requiresSelection = addresses.length > 1 && selectedAddressId === null;

  return {
    addresses,
    selectedAddressId,
    shouldShowContent,
    requiresSelection,
    hasNoAddresses: addresses.length === 0,
  };
};
