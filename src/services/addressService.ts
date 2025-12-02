const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export interface Address {
  _id: string;
  userId: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  address: string;
}

export interface UpdateAddressDto {
  address?: string;
  isActive?: boolean;
}

export const addressService = {
  // Get public active addresses for a user (no auth required)
  getPublicAddresses: async (userId: string): Promise<Address[]> => {
    const response = await fetch(`${API_BASE_URL}/address/public?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar endereços');
    }

    return response.json();
  },

  // Get all addresses for the authenticated user
  getAddresses: async (token: string): Promise<Address[]> => {
    const response = await fetch(`${API_BASE_URL}/address`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar endereços');
    }

    return response.json();
  },

  // Get a specific address by ID
  getAddressById: async (id: string, token: string): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}/address/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao buscar endereço');
    }

    return response.json();
  },

  // Create a new address
  createAddress: async (data: CreateAddressDto, token: string): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}/address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar endereço');
    }

    return response.json();
  },

  // Update an existing address
  updateAddress: async (id: string, data: UpdateAddressDto, token: string): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}/address/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar endereço');
    }

    return response.json();
  },

  // Delete an address
  deleteAddress: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/address/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao deletar endereço');
    }
  },
};
