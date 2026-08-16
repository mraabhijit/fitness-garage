import { api } from './api';
import {
  Achievement,
  ApiResponse,
  GalleryItem,
  Member,
  MembershipPlan,
  PaginatedApiResponse,
  Payment,
  Review,
  Service,
  SiteConfigItem,
  Trainer,
} from '../types';

export const adminService = {
  // Members
  async getMembers(page = 1, pageSize = 20, search?: string, status?: string): Promise<PaginatedApiResponse<Member>> {
    const res = await api.get<PaginatedApiResponse<Member>>('/admin/members', {
      params: { page, page_size: pageSize, search, status_filter: status },
    });
    return res.data;
  },

  async getMember(id: string): Promise<Member> {
    const res = await api.get<ApiResponse<Member>>(`/admin/members/${id}`);
    return res.data.data;
  },

  async createMember(data: Partial<Member>): Promise<Member> {
    const res = await api.post<ApiResponse<Member>>('/admin/members', data);
    return res.data.data;
  },

  async updateMember(id: string, data: Partial<Member>): Promise<Member> {
    const res = await api.put<ApiResponse<Member>>(`/admin/members/${id}`, data);
    return res.data.data;
  },

  async deleteMember(id: string): Promise<void> {
    await api.delete(`/admin/members/${id}`);
  },

  async importMembers(file: File): Promise<{ imported_count: number; failed_count: number; errors: any[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<{ imported_count: number; failed_count: number; errors: any[] }>>(
      '/admin/members/import',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data.data;
  },

  // Payments
  async getPayments(page = 1, pageSize = 20, memberId?: string, startDate?: string, endDate?: string): Promise<PaginatedApiResponse<Payment>> {
    const res = await api.get<PaginatedApiResponse<Payment>>('/admin/payments', {
      params: { page, page_size: pageSize, member_id: memberId, start_date: startDate, end_date: endDate },
    });
    return res.data;
  },

  async recordPayment(data: {
    member_id: string;
    membership_plan_id?: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    notes?: string;
    generate_invoice?: boolean;
  }): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>('/admin/payments', data);
    return res.data.data;
  },

  async getInvoiceUrl(paymentId: string): Promise<{ download_url: string }> {
    const res = await api.get<ApiResponse<{ payment_id: string; download_url: string }>>(
      `/admin/payments/${paymentId}/invoice`
    );
    return res.data.data;
  },

  // Plans
  async getPlans(): Promise<MembershipPlan[]> {
    const res = await api.get<ApiResponse<MembershipPlan[]>>('/admin/plans');
    return res.data.data;
  },

  async updatePlan(id: string, data: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const res = await api.put<ApiResponse<MembershipPlan>>(`/admin/plans/${id}`, data);
    return res.data.data;
  },

  // Services
  async getServices(): Promise<Service[]> {
    const res = await api.get<ApiResponse<Service[]>>('/admin/services');
    return res.data.data;
  },

  async createService(data: Partial<Service>): Promise<Service> {
    const res = await api.post<ApiResponse<Service>>('/admin/services', data);
    return res.data.data;
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const res = await api.put<ApiResponse<Service>>(`/admin/services/${id}`, data);
    return res.data.data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/admin/services/${id}`);
  },

  // Trainers
  async getTrainers(): Promise<Trainer[]> {
    const res = await api.get<ApiResponse<Trainer[]>>('/admin/trainers');
    return res.data.data;
  },

  async createTrainer(data: Partial<Trainer>): Promise<Trainer> {
    const res = await api.post<ApiResponse<Trainer>>('/admin/trainers', data);
    return res.data.data;
  },

  async updateTrainer(id: string, data: Partial<Trainer>): Promise<Trainer> {
    const res = await api.put<ApiResponse<Trainer>>(`/admin/trainers/${id}`, data);
    return res.data.data;
  },

  async deleteTrainer(id: string): Promise<void> {
    await api.delete(`/admin/trainers/${id}`);
  },

  // Gallery
  async getGallery(folder?: string): Promise<GalleryItem[]> {
    const res = await api.get<ApiResponse<GalleryItem[]>>('/admin/gallery', {
      params: { folder },
    });
    return res.data.data;
  },

  async createGalleryItem(data: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await api.post<ApiResponse<GalleryItem>>('/admin/gallery', data);
    return res.data.data;
  },

  async updateGalleryItem(id: string, data: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await api.put<ApiResponse<GalleryItem>>(`/admin/gallery/${id}`, data);
    return res.data.data;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    await api.delete(`/admin/gallery/${id}`);
  },

  // Site Config
  async getSiteConfigs(): Promise<SiteConfigItem[]> {
    const res = await api.get<ApiResponse<SiteConfigItem[]>>('/admin/site-config');
    return res.data.data;
  },

  async updateSiteConfigs(configs: Record<string, string>): Promise<SiteConfigItem[]> {
    const res = await api.put<ApiResponse<SiteConfigItem[]>>('/admin/site-config', { configs });
    return res.data.data;
  },

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const res = await api.get<ApiResponse<Achievement[]>>('/admin/achievements');
    return res.data.data;
  },

  async createAchievement(data: Partial<Achievement>): Promise<Achievement> {
    const res = await api.post<ApiResponse<Achievement>>('/admin/achievements', data);
    return res.data.data;
  },

  async updateAchievement(id: string, data: Partial<Achievement>): Promise<Achievement> {
    const res = await api.put<ApiResponse<Achievement>>(`/admin/achievements/${id}`, data);
    return res.data.data;
  },

  async deleteAchievement(id: string): Promise<void> {
    await api.delete(`/admin/achievements/${id}`);
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>('/admin/reviews');
    return res.data.data;
  },

  async updateReviewVisibility(id: string, isVisible: boolean): Promise<Review> {
    const res = await api.put<ApiResponse<Review>>(`/admin/reviews/${id}`, { is_visible: isVisible });
    return res.data.data;
  },

  async syncReviews(): Promise<{ synced: boolean; synced_count?: number }> {
    const res = await api.post<ApiResponse<{ synced: boolean; synced_count?: number }>>('/admin/reviews/sync');
    return res.data.data;
  },
};
