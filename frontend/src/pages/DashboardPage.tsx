import React, { useEffect, useState } from 'react'
import { okrService } from '../services/okrService'
import { companyService } from '../services/companyService'
import type { DashboardStats, Quarter, Company } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Target, TrendingUp, Award, Building } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedQuarter || selectedCompany) {
      loadStats()
    }
  }, [selectedQuarter, selectedCompany])

  const loadData = async () => {
    try {
      const [quartersData, companiesData] = await Promise.all([
        companyService.getQuarters(),
        companyService.getCompanies(),
      ])
      setQuarters(quartersData)
      setCompanies(companiesData)

      if (quartersData.length > 0) {
        setSelectedQuarter(quartersData[0].id)
      }
      if (companiesData.length > 0) {
        setSelectedCompany(companiesData[0].id)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await okrService.getDashboardStats({
        quarterId: selectedQuarter,
        companyId: selectedCompany,
      })
      setStats(statsData || null)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Quý</label>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          >
            {quarters.map((quarter) => (
              <option key={quarter.id} value={quarter.id}>
                {quarter.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Công ty</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Objectives</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalObjectives}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Công ty: {stats.objectivesByLevel.company} | Phòng ban:{' '}
                {stats.objectivesByLevel.department} | Nhân viên:{' '}
                {stats.objectivesByLevel.employee}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Key Results</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeyResults}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiến độ trung bình</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProgress}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${stats.averageProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
