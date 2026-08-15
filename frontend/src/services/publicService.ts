import { api } from './api';
import {
  Achievement,
  ApiResponse,
  GalleryItem,
  MembershipPlan,
  Review,
  Service,
  Trainer,
} from '../types';

export const publicService = {
  async getSiteConfig(): Promise<Record<string, string>> {
    const res = await api.get<ApiResponse<Record<string, string>>>('/public/site-config');
    return res.data.data;
  },

  async getAchievements(): Promise<Achievement[]> {
    const res = await api.get<ApiResponse<Achievement[]>>('/public/achievements');
    return res.data.data;
  },

  async getServices(): Promise<Service[]> {
    const res = await api.get<ApiResponse<Service[]>>('/public/services');
    return res.data.data;
  },

  async getPlans(): Promise<MembershipPlan[]> {
    const res = await api.get<ApiResponse<MembershipPlan[]>>('/public/plans');
    return res.data.data;
  },

  async getTrainers(): Promise<Trainer[]> {
    const res = await api.get<ApiResponse<Trainer[]>>('/public/trainers');
    return res.data.data;
  },

  async getGallery(folder?: string): Promise<GalleryItem[]> {
    const res = await api.get<ApiResponse<GalleryItem[]>>('/public/gallery', {
      params: { folder },
    });
    return res.data.data;
  },

  async getReviews(): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>('/public/reviews');
    return res.data.data;
  },
};
