import { apiRequest } from './api';

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
    return apiRequest<Address[]>({
      method: 'GET',
      path: `/address/public?userId=${userId}`,
    });
  },

  // Get all addresses for the authenticated user
  getAddresses: async (token: string): Promise<Address[]> => {
    return apiRequest<Address[]>({
      method: 'GET',
      path: '/address',
      token,
    });
  },

  // Get a specific address by ID
  getAddressById: async (id: string, token: string): Promise<Address> => {
    return apiRequest<Address>({
      method: 'GET',
      path: `/address/${id}`,
      token,
    });
  },

  // Create a new address
  createAddress: async (data: CreateAddressDto, token: string): Promise<Address> => {
    return apiRequest<Address>({
      method: 'POST',
      path: '/address',
      data,
      token,
    });
  },

  // Update an existing address
  updateAddress: async (id: string, data: UpdateAddressDto, token: string): Promise<Address> => {
    return apiRequest<Address>({
      method: 'PATCH',
      path: `/address/${id}`,
      data,
      token,
    });
  },

  // Delete an address
  deleteAddress: async (id: string, token: string): Promise<void> => {
    return apiRequest<void>({
      method: 'DELETE',
      path: `/address/${id}`,
      token,
    });
  },
};
