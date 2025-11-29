import api from './api'
import { Objective, KeyResult, Approval, DashboardStats, ApiResponse } from '../types'

export const okrService = {
  // Objectives
  createObjective: async (data: Partial<Objective>) => {
    const response = await api.post<ApiResponse<Objective>>('/objectives', data)
    return response.data.data
  },

  getObjectives: async (params?: {
    level?: string
    quarterId?: string
    companyId?: string
    departmentId?: string
    userId?: string
  }) => {
    const response = await api.get<ApiResponse<Objective[]>>('/objectives', { params })
    return response.data.data || []
  },

  getObjectiveById: async (id: string) => {
    const response = await api.get<ApiResponse<Objective>>(`/objectives/${id}`)
    return response.data.data
  },

  updateObjective: async (id: string, data: Partial<Objective>) => {
    const response = await api.put<ApiResponse<Objective>>(`/objectives/${id}`, data)
    return response.data.data
  },

  deleteObjective: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/objectives/${id}`)
    return response.data
  },

  // Key Results
  createKeyResult: async (data: Partial<KeyResult>) => {
    const response = await api.post<ApiResponse<KeyResult>>('/key-results', data)
    return response.data.data
  },

  getKeyResults: async (objectiveId?: string) => {
    const response = await api.get<ApiResponse<KeyResult[]>>('/key-results', {
      params: { objectiveId },
    })
    return response.data.data || []
  },

  updateKeyResult: async (id: string, data: Partial<KeyResult>) => {
    const response = await api.put<ApiResponse<KeyResult>>(`/key-results/${id}`, data)
    return response.data.data
  },

  updateProgress: async (id: string, value: number, comment?: string) => {
    const response = await api.post<ApiResponse>(`/key-results/${id}/progress`, {
      value,
      comment,
    })
    return response.data.data
  },

  deleteKeyResult: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/key-results/${id}`)
    return response.data
  },

  // Approvals
  getPendingApprovals: async () => {
    const response = await api.get<ApiResponse<Approval[]>>('/approvals/pending')
    return response.data.data || []
  },

  approveOrReject: async (id: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    const response = await api.post<ApiResponse<Approval>>(`/approvals/${id}/review`, {
      status,
      comment,
    })
    return response.data.data
  },

  getApprovalHistory: async (keyResultId?: string) => {
    const response = await api.get<ApiResponse<Approval[]>>('/approvals/history', {
      params: { keyResultId },
    })
    return response.data.data || []
  },

  // Dashboard
  getDashboardStats: async (params?: {
    quarterId?: string
    companyId?: string
    departmentId?: string
  }) => {
    const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats', { params })
    return response.data.data
  },

  getOKRHierarchy: async (params?: { quarterId?: string; companyId?: string }) => {
    const response = await api.get<ApiResponse<Objective[]>>('/dashboard/hierarchy', { params })
    return response.data.data || []
  },

  getProgressTrend: async (keyResultId: string) => {
    const response = await api.get<ApiResponse>('/dashboard/progress-trend', {
      params: { keyResultId },
    })
    return response.data.data || []
  },
}
