import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Entity, PaginatedResponse, QueryParams } from '../types';

export function useCrud<T extends Entity>(resourceUrl: string) {
  const queryClient = useQueryClient();

  // Fetch all items with optional filtering
  const getAll = (params?: QueryParams) => {
    return useQuery<PaginatedResponse<T>>({
      queryKey: [resourceUrl, params],
      queryFn: async () => {
        const response = await api.get<PaginatedResponse<T>>(resourceUrl, { params });
        return response.data;
      },
    });
  };

  // Fetch a single item by ID
  const getById = (id: string | number) => {
    return useQuery<T>({
      queryKey: [resourceUrl, id],
      queryFn: async () => {
        const response = await api.get<T>(`${resourceUrl}/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create a new item
  const create = useMutation<T, Error, Partial<T>>({
    mutationFn: async (data) => {
      const response = await api.post<T>(resourceUrl, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceUrl] });
    },
  });

  // Update an existing item
  const update = useMutation<T, Error, { id: string | number; data: Partial<T> }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.put<T>(`${resourceUrl}/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [resourceUrl] });
      queryClient.invalidateQueries({ queryKey: [resourceUrl, variables.id] });
    },
  });

  // Delete an item
  const remove = useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      await api.delete(`${resourceUrl}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourceUrl] });
    },
  });

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
