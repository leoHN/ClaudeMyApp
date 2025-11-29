import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

const createCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const createCompany = async (req: AuthRequest, res: Response) => {
  try {
    const validated = createCompanySchema.parse(req.body);

    const company = await prisma.company.create({
      data: {
        name: validated.name,
        description: validated.description,
      },
    });

    return res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    throw error;
  }
};

export const getCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        departments: true,
        _count: {
          select: {
            objectives: true,
            departments: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    throw error;
  }
};

export const getCompanyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        departments: {
          include: {
            _count: {
              select: {
                users: true,
                objectives: true,
              },
            },
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

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    return res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    throw error;
  }
};

export const updateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.company.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};
