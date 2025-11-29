import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

const createDepartmentSchema = z.object({
  name: z.string().min(1),
  companyId: z.string(),
});

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const validated = createDepartmentSchema.parse(req.body);

    const department = await prisma.department.create({
      data: {
        name: validated.name,
        companyId: validated.companyId,
      },
      include: {
        company: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId } = req.query;

    const where: any = {};
    if (companyId) where.companyId = companyId as string;

    const departments = await prisma.department.findMany({
      where,
      include: {
        company: true,
        _count: {
          select: {
            users: true,
            objectives: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    throw error;
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        company: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        objectives: {
          include: {
            quarter: true,
            keyResults: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    return res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    throw error;
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
      },
    });

    return res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
