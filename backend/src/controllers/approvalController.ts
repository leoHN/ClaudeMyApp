import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';
import { ApprovalStatus } from '@prisma/client';

const approveRejectSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comment: z.string().optional(),
});

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's department if they're a department head
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build query based on user role
    let where: any = {
      status: 'PENDING',
    };

    if (user.role === 'DEPARTMENT_HEAD' && user.departmentId) {
      // Department heads can approve their department's approvals
      where.keyResult = {
        objective: {
          OR: [
            { departmentId: user.departmentId },
            {
              level: 'EMPLOYEE',
              user: {
                departmentId: user.departmentId,
              },
            },
          ],
        },
      };
    } else if (user.role === 'ADMIN') {
      // Admins can approve company-level approvals
      where.keyResult = {
        objective: {
          level: 'COMPANY',
        },
      };
    } else {
      // Regular employees can't approve
      return res.json({
        success: true,
        data: [],
      });
    }

    const approvals = await prisma.approval.findMany({
      where,
      include: {
        progressUpdate: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        keyResult: {
          include: {
            objective: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                department: true,
              },
            },
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: approvals,
    });
  } catch (error) {
    throw error;
  }
};

export const approveOrReject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validated = approveRejectSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the approval
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        keyResult: {
          include: {
            objective: true,
          },
        },
        progressUpdate: true,
      },
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval not found' });
    }

    if (approval.status !== 'PENDING') {
      return res.status(400).json({ error: 'Approval already processed' });
    }

    // Update approval
    const updatedApproval = await prisma.approval.update({
      where: { id },
      data: {
        status: validated.status,
        comment: validated.comment,
        approverId: req.user.userId,
      },
      include: {
        progressUpdate: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        keyResult: {
          include: {
            objective: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If approved, update the key result's current value
    if (validated.status === 'APPROVED') {
      await prisma.keyResult.update({
        where: { id: approval.keyResultId },
        data: {
          currentValue: approval.progressUpdate.value,
        },
      });
    }

    return res.json({
      success: true,
      data: updatedApproval,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const getApprovalHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { keyResultId } = req.query;

    const where: any = {};
    if (keyResultId) where.keyResultId = keyResultId as string;

    const approvals = await prisma.approval.findMany({
      where,
      include: {
        progressUpdate: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        keyResult: {
          include: {
            objective: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: approvals,
    });
  } catch (error) {
    throw error;
  }
};
