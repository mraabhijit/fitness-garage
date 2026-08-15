import { api } from './api';
import { ApiResponse, Member, PaginatedApiResponse, Payment } from '../types';

export const memberService = {
  async getMyProfile(): Promise<Member> {
    const res = await api.get<ApiResponse<Member>>('/member/me');
    return res.data.data;
  },

  async getMyPayments(page = 1, pageSize = 20): Promise<PaginatedApiResponse<Payment>> {
    const res = await api.get<PaginatedApiResponse<Payment>>('/member/payments', {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  async getInvoiceUrl(paymentId: string): Promise<{ download_url: string }> {
    const res = await api.get<ApiResponse<{ payment_id: string; download_url: string }>>(
      `/member/payments/${paymentId}/invoice`
    );
    return res.data.data;
  },
};
