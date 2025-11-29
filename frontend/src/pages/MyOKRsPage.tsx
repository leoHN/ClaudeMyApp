import React, { useEffect, useState } from 'react'
import { okrService } from '../services/okrService'
import { useAuth } from '../contexts/AuthContext'
import { Objective, KeyResult } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { calculateProgress, getProgressColor } from '../lib/utils'

export const MyOKRsPage: React.FC = () => {
  const { user } = useAuth()
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [updateValue, setUpdateValue] = useState<{ [key: string]: number }>({})
  const [updateComment, setUpdateComment] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadMyOKRs()
  }, [user])

  const loadMyOKRs = async () => {
    if (!user) return

    try {
      const data = await okrService.getObjectives({
        userId: user.id,
      })
      setObjectives(data)
    } catch (error) {
      console.error('Error loading OKRs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProgress = async (keyResultId: string) => {
    const value = updateValue[keyResultId]
    const comment = updateComment[keyResultId]

    if (value === undefined) {
      alert('Vui lòng nhập giá trị')
      return
    }

    try {
      await okrService.updateProgress(keyResultId, value, comment)
      alert('Cập nhật thành công! Đang chờ phê duyệt.')
      setUpdateValue({ ...updateValue, [keyResultId]: 0 })
      setUpdateComment({ ...updateComment, [keyResultId]: '' })
      loadMyOKRs()
    } catch (error) {
      console.error('Error updating progress:', error)
      alert('Có lỗi xảy ra')
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
      <h1 className="text-3xl font-bold">OKR của tôi</h1>

      {objectives.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Bạn chưa có OKR nào được giao
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {objectives.map((objective) => (
            <Card key={objective.id}>
              <CardHeader>
                <CardTitle>{objective.title}</CardTitle>
                {objective.description && (
                  <p className="text-sm text-muted-foreground mt-2">{objective.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {objective.keyResults && objective.keyResults.length > 0 ? (
                  objective.keyResults.map((kr) => {
                    const progress = calculateProgress(kr.currentValue, kr.target)
                    return (
                      <div key={kr.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{kr.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Mục tiêu: {kr.target} {kr.unit}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Hiện tại: {kr.currentValue} {kr.unit}
                            </p>
                          </div>
                          <div className={`text-lg font-bold ${getProgressColor(progress)}`}>
                            {progress}%
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        {/* Update Progress Form */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                          <h5 className="font-medium text-sm">Cập nhật tiến độ</h5>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder={`Giá trị (${kr.unit})`}
                              value={updateValue[kr.id] || ''}
                              onChange={(e) =>
                                setUpdateValue({
                                  ...updateValue,
                                  [kr.id]: parseFloat(e.target.value),
                                })
                              }
                              className="flex-1"
                            />
                            <Input
                              type="text"
                              placeholder="Ghi chú (tùy chọn)"
                              value={updateComment[kr.id] || ''}
                              onChange={(e) =>
                                setUpdateComment({
                                  ...updateComment,
                                  [kr.id]: e.target.value,
                                })
                              }
                              className="flex-1"
                            />
                            <Button onClick={() => handleUpdateProgress(kr.id)}>
                              Gửi phê duyệt
                            </Button>
                          </div>
                        </div>

                        {/* Recent Updates */}
                        {kr.progressUpdates && kr.progressUpdates.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Lịch sử cập nhật</h5>
                            {kr.progressUpdates.slice(0, 3).map((update) => (
                              <div
                                key={update.id}
                                className="text-xs bg-white rounded p-2 flex justify-between"
                              >
                                <div>
                                  <span className="font-medium">
                                    {update.value} {kr.unit}
                                  </span>
                                  {update.comment && (
                                    <span className="text-muted-foreground ml-2">
                                      - {update.comment}
                                    </span>
                                  )}
                                </div>
                                {update.approval && (
                                  <span
                                    className={`font-medium ${
                                      update.approval.status === 'APPROVED'
                                        ? 'text-green-600'
                                        : update.approval.status === 'REJECTED'
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                    }`}
                                  >
                                    {update.approval.status === 'APPROVED' && 'Đã duyệt'}
                                    {update.approval.status === 'REJECTED' && 'Từ chối'}
                                    {update.approval.status === 'PENDING' && 'Chờ duyệt'}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chưa có Key Result nào cho Objective này
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
