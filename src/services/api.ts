import { Attraction, ElectricalPlan, MaintenanceRecord, User } from '../types';
import { mockAttractions, mockMaintenanceRecords, mockPlans } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://parque-cafe-api.onrender.com/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

type ApiResponse<T> = { data: T };

const getToken = () => localStorage.getItem('pcp_token');

const defaultTechnicalSpecs = {
  manufacturer: 'Sin registrar',
  model: 'Sin registrar',
  year_installed: new Date().getFullYear(),
  installed_power_kw: 0,
  operating_voltage_v: [220],
  control_voltage_v: 24,
  frequency_hz: 60,
  protection_ip: 'N/A',
  motors: [],
  vfds: [],
  plcs: [],
  sensors: [],
  certifications: [],
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? 'Error de comunicación con el servidor');
  }

  return payload as T;
}

const enrichAttraction = (attraction: Partial<Attraction> & { id: string }): Attraction => {
  const local = mockAttractions.find(item => item.id === attraction.id);
  return {
    ...local,
    ...attraction,
    description: attraction.description ?? local?.description ?? '',
    image: attraction.image ?? local?.image ?? '',
    capacity: attraction.capacity ?? local?.capacity ?? 0,
    height_m: attraction.height_m ?? local?.height_m ?? 0,
    duration_min: attraction.duration_min ?? local?.duration_min ?? 0,
    total_plans: attraction.total_plans ?? local?.total_plans ?? 0,
    pending_docs: attraction.pending_docs ?? local?.pending_docs ?? 0,
    last_maintenance: attraction.last_maintenance ?? local?.last_maintenance ?? new Date().toISOString(),
    next_maintenance: attraction.next_maintenance ?? local?.next_maintenance ?? new Date().toISOString(),
    technical_specs: {
      ...defaultTechnicalSpecs,
      ...local?.technical_specs,
      ...attraction.technical_specs,
    },
  } as Attraction;
};

const enrichPlan = (plan: Partial<ElectricalPlan> & { id: string }): ElectricalPlan => {
  const local = mockPlans.find(item => item.id === plan.id);
  return {
    ...local,
    ...plan,
    attraction_id: plan.attraction_id ?? local?.attraction_id ?? '',
    plan_number: plan.plan_number ?? local?.plan_number ?? '',
    current_version: plan.current_version ?? local?.current_version ?? 'Rev. 0',
    file_url: plan.file_url ?? local?.file_url ?? '',
    file_size_kb: plan.file_size_kb ?? local?.file_size_kb ?? 0,
    pages: plan.pages ?? local?.pages ?? 1,
    revisions: plan.revisions ?? local?.revisions ?? [],
    comments: plan.comments ?? local?.comments ?? [],
    tags: plan.tags ?? local?.tags ?? [],
    description: plan.description ?? local?.description ?? '',
    created_date: plan.created_date ?? local?.created_date ?? new Date().toISOString(),
    updated_date: plan.updated_date ?? local?.updated_date ?? new Date().toISOString(),
    author: plan.author ?? local?.author ?? 'Servidor',
  } as ElectricalPlan;
};

export const resolveFileUrl = (fileUrl?: string) => {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  return `${API_ORIGIN}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
};

export const api = {
  async login(email: string, password: string) {
    return request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async me() {
    return request<{ user: User }>('/auth/me');
  },

  async getAttractions() {
    const response = await request<ApiResponse<Array<Partial<Attraction> & { id: string }>>>('/attractions');
    return response.data.map(enrichAttraction);
  },

  async getAttraction(id: string) {
    const response = await request<ApiResponse<Partial<Attraction> & { id: string }>>(`/attractions/${id}`);
    return enrichAttraction(response.data);
  },

  async createAttraction(data: Partial<Attraction>, imageFile?: File) {
    let response: ApiResponse<Partial<Attraction> & { id: string }>;
    if (imageFile) {
      const formData = new FormData();
      formData.set('image', imageFile);
      // Serializar cada campo del objeto en el form
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      response = await request<ApiResponse<Partial<Attraction> & { id: string }>>('/attractions', {
        method: 'POST',
        body: formData,
      });
    } else {
      response = await request<ApiResponse<Partial<Attraction> & { id: string }>>('/attractions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
    return enrichAttraction(response.data);
  },

  async updateAttraction(id: string, data: Partial<Attraction>, imageFile?: File) {
    let response: ApiResponse<Partial<Attraction> & { id: string }>;
    if (imageFile) {
      const formData = new FormData();
      formData.set('image', imageFile);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      response = await request<ApiResponse<Partial<Attraction> & { id: string }>>(`/attractions/${id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      response = await request<ApiResponse<Partial<Attraction> & { id: string }>>(`/attractions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
    return enrichAttraction(response.data);
  },

  async deleteAttraction(id: string) {
    await request<ApiResponse<Partial<Attraction> & { id: string }>>(`/attractions/${id}`, {
      method: 'DELETE',
    });
  },

  async getPlans(attractionId?: string) {
    const query = attractionId ? `?attraction_id=${encodeURIComponent(attractionId)}` : '';
    const response = await request<ApiResponse<Array<Partial<ElectricalPlan> & { id: string }>>>(`/plans${query}`);
    return response.data.map(enrichPlan);
  },

  async getPlan(id: string) {
    const response = await request<ApiResponse<Partial<ElectricalPlan> & { id: string }>>(`/plans/${id}`);
    return enrichPlan(response.data);
  },

  async deletePlan(id: string) {
    await request<ApiResponse<void>>(`/plans/${id}`, {
      method: 'DELETE',
    });
  },

  async updatePlan(id: string, data: Partial<ElectricalPlan>) {
    const response = await request<ApiResponse<Partial<ElectricalPlan> & { id: string }>>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return enrichPlan(response.data);
  },

  async getUsers() {
    const response = await request<ApiResponse<User[]>>('/users');
    return response.data;
  },

  async createUser(data: Partial<User> & { password?: string }, avatarFile?: File) {
    if (avatarFile) {
      const formData = new FormData();
      formData.set('avatar', avatarFile);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.set(key, String(value));
      });
      const response = await request<ApiResponse<User>>('/users', { method: 'POST', body: formData });
      return response.data;
    }
    const response = await request<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateUser(id: string, data: Partial<User> & { password?: string }, avatarFile?: File) {
    if (avatarFile) {
      const formData = new FormData();
      formData.set('avatar', avatarFile);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.set(key, String(value));
      });
      const response = await request<ApiResponse<User>>(`/users/${id}`, { method: 'PUT', body: formData });
      return response.data;
    }
    const response = await request<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async deleteUser(id: string) {
    await request<ApiResponse<User>>(`/users/${id}`, { method: 'DELETE' });
  },

  async getMe() {
    const response = await request<{ user: User }>('/auth/me');
    return response.user;
  },

  async updateMe(data: { name?: string; password?: string }, avatarFile?: File) {
    if (avatarFile) {
      const formData = new FormData();
      formData.set('avatar', avatarFile);
      if (data.name) formData.set('name', data.name);
      if (data.password) formData.set('password', data.password);
      const response = await request<{ user: User }>('/auth/me', { method: 'PUT', body: formData });
      return response.user;
    }
    const response = await request<{ user: User }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.user;
  },

  async getMaintenance(attractionId?: string) {
    const query = attractionId ? `?attraction_id=${encodeURIComponent(attractionId)}` : '';
    const response = await request<ApiResponse<MaintenanceRecord[]>>(`/maintenance${query}`);
    const serverRecords = response.data;
    if (attractionId) {
      const localRecords = mockMaintenanceRecords.filter(item => item.attraction_id === attractionId);
      return serverRecords.length ? serverRecords : localRecords;
    }
    return serverRecords.length ? serverRecords : mockMaintenanceRecords;
  },

  async uploadPlan(data: Partial<ElectricalPlan>, file: File) {
    const formData = new FormData();
    formData.set('file', file);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.set(key, String(value));
    });

    const response = await request<ApiResponse<Partial<ElectricalPlan> & { id: string }>>('/plans', {
      method: 'POST',
      body: formData,
    });

    return enrichPlan(response.data);
  },

  async addComment(planId: string, content: string, pageRef?: number) {
    const response = await request<ApiResponse<Partial<ElectricalPlan> & { id: string }>>(`/plans/${planId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, pageRef }),
    });
    return enrichPlan(response.data);
  },

  async resolveComment(planId: string, commentId: string) {
    const response = await request<ApiResponse<Partial<ElectricalPlan> & { id: string }>>(`/plans/${planId}/comments/${commentId}/resolve`, {
      method: 'PATCH',
    });
    return enrichPlan(response.data);
  },

  async deleteComment(planId: string, commentId: string) {
    const response = await request<ApiResponse<Partial<ElectricalPlan> & { id: string }>>(`/plans/${planId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    return enrichPlan(response.data);
  },
};
