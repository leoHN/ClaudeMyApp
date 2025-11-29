import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

const createQuarterSchema = z.object({
  name: z.string().min(1),
  year: z.number().int().min(2020),
  quarter: z.number().int().min(1).max(4),
  startDate: z.string(),
  endDate: z.string(),
});

export const createQuarter = async (req: AuthRequest, res: Response) => {
  try {
    const validated = createQuarterSchema.parse(req.body);

    const quarter = await prisma.quarter.create({
      data: {
        name: validated.name,
        year: validated.year,
        quarter: validated.quarter,
        startDate: new Date(validated.startDate),
        endDate: new Date(validated.endDate),
      },
    });

    return res.status(201).json({
      success: true,
      data: quarter,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const getQuarters = async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;

    const where: any = {};
    if (year) where.year = parseInt(year as string);

    const quarters = await prisma.quarter.findMany({
      where,
      include: {
        _count: {
          select: {
            objectives: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { quarter: 'desc' },
      ],
    });

    return res.json({
      success: true,
      data: quarters,
    });
  } catch (error) {
    throw error;
  }
};

export const getQuarterById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const quarter = await prisma.quarter.findUnique({
      where: { id },
      include: {
        objectives: {
          include: {
            keyResults: true,
            company: true,
            department: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!quarter) {
      return res.status(404).json({ error: 'Quarter not found' });
    }

    return res.json({
      success: true,
      data: quarter,
    });
  } catch (error) {
    throw error;
  }
};

export const updateQuarter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;

    const quarter = await prisma.quarter.update({
      where: { id },
      data: {
        name,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return res.json({
      success: true,
      data: quarter,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteQuarter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.quarter.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Quarter deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
