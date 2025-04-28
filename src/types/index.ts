// Define your data types here
export interface Entity {
  id: string | number;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

// Company type for both list and detail views
export interface Company {
  id: string;
  name: string;
  email?: string;
  slackChannel?: string;
  whatsappId?: string;
  whatsappName?: string;
  whatsappDisplayNumber?: string;
}

// Business API response format for list
export interface BusinessResponse {
  businesses: Company[];
  count: number;
}

// Provider type
export interface Provider {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  businessId: string;
}

// Provider list response
export interface ProviderListResponse {
  providers: Provider[];
  count: number;
}
