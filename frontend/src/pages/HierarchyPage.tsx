import React, { useEffect, useState } from 'react'
import { okrService } from '../services/okrService'
import { companyService } from '../services/companyService'
import type { Objective, Quarter, Company } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { calculateProgress, getProgressColor } from '../lib/utils'

const ObjectiveNode: React.FC<{ objective: Objective; level: number }> = ({
  objective,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = objective.children && objective.children.length > 0

  const avgProgress = objective.keyResults
    ? objective.keyResults.reduce((sum, kr) => {
        return sum + calculateProgress(kr.currentValue, kr.target)
      }, 0) / (objective.keyResults.length || 1)
    : 0

  return (
    <div className={`ml-${level * 6}`}>
      <Card className="mb-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1">
              {hasChildren && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              <div className="flex-1">
                <CardTitle className="text-lg">{objective.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {objective.level === 'COMPANY' && '🏢 Công ty'}
                    {objective.level === 'DEPARTMENT' && '🏬 Phòng ban'}
                    {objective.level === 'EMPLOYEE' && '👤 Nhân viên'}
                  </span>
                  {objective.user && (
                    <span className="text-xs text-muted-foreground">
                      • {objective.user.name}
                    </span>
                  )}
                  {objective.department && (
                    <span className="text-xs text-muted-foreground">
                      • {objective.department.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${getProgressColor(avgProgress)}`}>
                {Math.round(avgProgress)}%
              </div>
            </div>
          </div>
        </CardHeader>
        {objective.keyResults && objective.keyResults.length > 0 && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              {objective.keyResults.map((kr) => {
                const progress = calculateProgress(kr.currentValue, kr.target)
                return (
                  <div key={kr.id} className="flex items-center justify-between py-2 border-t">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{kr.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {kr.currentValue} / {kr.target} {kr.unit}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className={`text-sm font-medium ${getProgressColor(progress)} w-12 text-right`}>
                        {progress}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {isExpanded && hasChildren && (
        <div className="ml-6 border-l-2 border-gray-200 pl-4">
          {objective.children!.map((child) => (
            <ObjectiveNode key={child.id} objective={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export const HierarchyPage: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<Objective[]>([])
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState<string>('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedQuarter && selectedCompany) {
      loadHierarchy()
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

  const loadHierarchy = async () => {
    try {
      const data = await okrService.getOKRHierarchy({
        quarterId: selectedQuarter,
        companyId: selectedCompany,
      })
      setHierarchy(data)
    } catch (error) {
      console.error('Error loading hierarchy:', error)
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
      <h1 className="text-3xl font-bold">Cấu trúc OKR</h1>

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

      {/* Hierarchy Tree */}
      <div className="space-y-4">
        {hierarchy.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Chưa có OKR nào được tạo cho quý này
            </CardContent>
          </Card>
        ) : (
          hierarchy.map((objective) => (
            <ObjectiveNode key={objective.id} objective={objective} level={0} />
          ))
        )}
      </div>
    </div>
  )
}
