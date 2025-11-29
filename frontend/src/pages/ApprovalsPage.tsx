import React, { useEffect, useState } from 'react'
import { okrService } from '../services/okrService'
import type { Approval } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { CheckCircle, XCircle } from 'lucide-react'

export const ApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    loadPendingApprovals()
  }, [])

  const loadPendingApprovals = async () => {
    try {
      const data = await okrService.getPendingApprovals()
      setApprovals(data)
    } catch (error) {
      console.error('Error loading approvals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (approvalId: string) => {
    try {
      await okrService.approveOrReject(approvalId, 'APPROVED', comment[approvalId])
      alert('Đã phê duyệt thành công')
      loadPendingApprovals()
    } catch (error) {
      console.error('Error approving:', error)
      alert('Có lỗi xảy ra')
    }
  }

  const handleReject = async (approvalId: string) => {
    const rejectComment = comment[approvalId]
    if (!rejectComment || rejectComment.trim() === '') {
      alert('Vui lòng nhập lý do từ chối')
      return
    }

    try {
      await okrService.approveOrReject(approvalId, 'REJECTED', rejectComment)
      alert('Đã từ chối')
      loadPendingApprovals()
    } catch (error) {
      console.error('Error rejecting:', error)
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
      <h1 className="text-3xl font-bold">Phê duyệt</h1>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Không có yêu cầu phê duyệt nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {approval.keyResult?.objective?.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    Key Result: {approval.keyResult?.title}
                  </div>
                  <div>
                    Người gửi: {approval.progressUpdate?.user?.name} (
                    {approval.progressUpdate?.user?.email})
                  </div>
                  {approval.keyResult?.objective?.department && (
                    <div>Phòng ban: {approval.keyResult.objective.department.name}</div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Giá trị hiện tại</div>
                      <div className="text-lg font-semibold">
                        {approval.keyResult?.currentValue} {approval.keyResult?.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Giá trị cập nhật</div>
                      <div className="text-lg font-semibold text-primary">
                        {approval.progressUpdate?.value} {approval.keyResult?.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Mục tiêu</div>
                      <div className="text-lg font-semibold">
                        {approval.keyResult?.target} {approval.keyResult?.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Tiến độ mới</div>
                      <div className="text-lg font-semibold text-green-600">
                        {Math.round(
                          ((approval.progressUpdate?.value || 0) /
                            (approval.keyResult?.target || 1)) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  </div>

                  {approval.progressUpdate?.comment && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">Ghi chú</div>
                      <div className="text-sm mt-1">{approval.progressUpdate.comment}</div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Input
                    placeholder="Nhận xét (tùy chọn cho phê duyệt, bắt buộc cho từ chối)"
                    value={comment[approval.id] || ''}
                    onChange={(e) =>
                      setComment({ ...comment, [approval.id]: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(approval.id)}
                      className="flex-1"
                      variant="default"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Phê duyệt
                    </Button>
                    <Button
                      onClick={() => handleReject(approval.id)}
                      className="flex-1"
                      variant="destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
