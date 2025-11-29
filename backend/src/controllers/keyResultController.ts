import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

const createKeyResultSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  target: z.number(),
  unit: z.string(),
  objectiveId: z.string(),
});

const updateProgressSchema = z.object({
  value: z.number(),
  comment: z.string().optional(),
});

export const createKeyResult = async (req: AuthRequest, res: Response) => {
  try {
    const validated = createKeyResultSchema.parse(req.body);

    const keyResult = await prisma.keyResult.create({
      data: {
        title: validated.title,
        description: validated.description,
        target: validated.target,
        unit: validated.unit,
        objectiveId: validated.objectiveId,
      },
      include: {
        objective: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: keyResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const getKeyResults = async (req: AuthRequest, res: Response) => {
  try {
    const { objectiveId } = req.query;

    const where: any = {};
    if (objectiveId) where.objectiveId = objectiveId as string;

    const keyResults = await prisma.keyResult.findMany({
      where,
      include: {
        objective: true,
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
    });

    return res.json({
      success: true,
      data: keyResults,
    });
  } catch (error) {
    throw error;
  }
};

export const updateKeyResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, target, unit } = req.body;

    const keyResult = await prisma.keyResult.update({
      where: { id },
      data: {
        title,
        description,
        target,
        unit,
      },
    });

    return res.json({
      success: true,
      data: keyResult,
    });
  } catch (error) {
    throw error;
  }
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updateProgressSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create progress update
    const progressUpdate = await prisma.progressUpdate.create({
      data: {
        value: validated.value,
        comment: validated.comment,
        keyResultId: id,
        userId: req.user.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create approval record (status: PENDING)
    const approval = await prisma.approval.create({
      data: {
        progressUpdateId: progressUpdate.id,
        keyResultId: id,
        status: 'PENDING',
      },
      include: {
        progressUpdate: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        progressUpdate,
        approval,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const deleteKeyResult = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.keyResult.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Key result deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
