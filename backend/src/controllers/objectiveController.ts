import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';
import { OKRLevel } from '@prisma/client';

const createObjectiveSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  level: z.enum(['COMPANY', 'DEPARTMENT', 'EMPLOYEE']),
  quarterId: z.string(),
  companyId: z.string().optional(),
  departmentId: z.string().optional(),
  userId: z.string().optional(),
  parentId: z.string().optional(),
});

export const createObjective = async (req: AuthRequest, res: Response) => {
  try {
    const validated = createObjectiveSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate ownership based on level
    if (validated.level === 'COMPANY' && !validated.companyId) {
      return res.status(400).json({ error: 'Company ID required for company-level OKR' });
    }
    if (validated.level === 'DEPARTMENT' && !validated.departmentId) {
      return res.status(400).json({ error: 'Department ID required for department-level OKR' });
    }
    if (validated.level === 'EMPLOYEE' && !validated.userId) {
      return res.status(400).json({ error: 'User ID required for employee-level OKR' });
    }

    const objective = await prisma.objective.create({
      data: {
        title: validated.title,
        description: validated.description,
        level: validated.level,
        quarterId: validated.quarterId,
        companyId: validated.companyId,
        departmentId: validated.departmentId,
        userId: validated.userId,
        parentId: validated.parentId,
        assignedById: req.user.userId,
      },
      include: {
        quarter: true,
        company: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: true,
        keyResults: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: objective,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const getObjectives = async (req: AuthRequest, res: Response) => {
  try {
    const { level, quarterId, companyId, departmentId, userId } = req.query;

    const where: any = {};

    if (level) where.level = level as OKRLevel;
    if (quarterId) where.quarterId = quarterId as string;
    if (companyId) where.companyId = companyId as string;
    if (departmentId) where.departmentId = departmentId as string;
    if (userId) where.userId = userId as string;

    const objectives = await prisma.objective.findMany({
      where,
      include: {
        quarter: true,
        company: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: true,
        children: {
          include: {
            keyResults: true,
          },
        },
        keyResults: {
          include: {
            progressUpdates: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
        assignedBy: {
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
      data: objectives,
    });
  } catch (error) {
    throw error;
  }
};

export const getObjectiveById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const objective = await prisma.objective.findUnique({
      where: { id },
      include: {
        quarter: true,
        company: true,
        department: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parent: true,
        children: {
          include: {
            keyResults: {
              include: {
                progressUpdates: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                },
              },
            },
          },
        },
        keyResults: {
          include: {
            progressUpdates: {
              orderBy: {
                createdAt: 'desc',
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                approval: {
                  include: {
                    approver: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        assignedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!objective) {
      return res.status(404).json({ error: 'Objective not found' });
    }

    return res.json({
      success: true,
      data: objective,
    });
  } catch (error) {
    throw error;
  }
};

export const updateObjective = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const objective = await prisma.objective.update({
      where: { id },
      data: {
        title,
        description,
      },
      include: {
        keyResults: true,
      },
    });

    return res.json({
      success: true,
      data: objective,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteObjective = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.objective.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Objective deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
