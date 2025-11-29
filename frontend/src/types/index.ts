export type UserRole = 'ADMIN' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'
export type OKRLevel = 'COMPANY' | 'DEPARTMENT' | 'EMPLOYEE'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  departmentId?: string
  department?: Department
}

export interface Company {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  companyId: string
  company?: Company
  createdAt: string
  updatedAt: string
}

export interface Quarter {
  id: string
  name: string
  year: number
  quarter: number
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface Objective {
  id: string
  title: string
  description?: string
  level: OKRLevel
  quarterId: string
  quarter?: Quarter
  companyId?: string
  company?: Company
  departmentId?: string
  department?: Department
  userId?: string
  user?: User
  parentId?: string
  parent?: Objective
  children?: Objective[]
  assignedById?: string
  assignedBy?: User
  keyResults?: KeyResult[]
  createdAt: string
  updatedAt: string
}

export interface KeyResult {
  id: string
  title: string
  description?: string
  target: number
  unit: string
  currentValue: number
  objectiveId: string
  objective?: Objective
  progressUpdates?: ProgressUpdate[]
  approvals?: Approval[]
  createdAt: string
  updatedAt: string
}

export interface ProgressUpdate {
  id: string
  value: number
  comment?: string
  keyResultId: string
  keyResult?: KeyResult
  userId: string
  user?: User
  approval?: Approval
  createdAt: string
  updatedAt: string
}

export interface Approval {
  id: string
  status: ApprovalStatus
  comment?: string
  progressUpdateId: string
  progressUpdate?: ProgressUpdate
  keyResultId: string
  keyResult?: KeyResult
  approverId?: string
  approver?: User
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  totalObjectives: number
  objectivesByLevel: {
    company: number
    department: number
    employee: number
  }
  totalKeyResults: number
  averageProgress: number
  completionRate: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  departmentId?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: any
}
