import api from './api'
import { Company, Department, Quarter, ApiResponse } from '../types'

export const companyService = {
  // Companies
  getCompanies: async () => {
    const response = await api.get<ApiResponse<Company[]>>('/companies')
    return response.data.data || []
  },

  getCompanyById: async (id: string) => {
    const response = await api.get<ApiResponse<Company>>(`/companies/${id}`)
    return response.data.data
  },

  createCompany: async (data: Partial<Company>) => {
    const response = await api.post<ApiResponse<Company>>('/companies', data)
    return response.data.data
  },

  updateCompany: async (id: string, data: Partial<Company>) => {
    const response = await api.put<ApiResponse<Company>>(`/companies/${id}`, data)
    return response.data.data
  },

  deleteCompany: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/companies/${id}`)
    return response.data
  },

  // Departments
  getDepartments: async (companyId?: string) => {
    const response = await api.get<ApiResponse<Department[]>>('/departments', {
      params: { companyId },
    })
    return response.data.data || []
  },

  getDepartmentById: async (id: string) => {
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`)
    return response.data.data
  },

  createDepartment: async (data: Partial<Department>) => {
    const response = await api.post<ApiResponse<Department>>('/departments', data)
    return response.data.data
  },

  updateDepartment: async (id: string, data: Partial<Department>) => {
    const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, data)
    return response.data.data
  },

  deleteDepartment: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/departments/${id}`)
    return response.data
  },

  // Quarters
  getQuarters: async (year?: number) => {
    const response = await api.get<ApiResponse<Quarter[]>>('/quarters', {
      params: { year },
    })
    return response.data.data || []
  },

  getQuarterById: async (id: string) => {
    const response = await api.get<ApiResponse<Quarter>>(`/quarters/${id}`)
    return response.data.data
  },

  createQuarter: async (data: Partial<Quarter>) => {
    const response = await api.post<ApiResponse<Quarter>>('/quarters', data)
    return response.data.data
  },

  updateQuarter: async (id: string, data: Partial<Quarter>) => {
    const response = await api.put<ApiResponse<Quarter>>(`/quarters/${id}`, data)
    return response.data.data
  },

  deleteQuarter: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/quarters/${id}`)
    return response.data
  },
}
