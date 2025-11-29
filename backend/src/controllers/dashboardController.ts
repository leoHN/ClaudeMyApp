import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const { quarterId, companyId, departmentId } = req.query;

    // Build base where clause
    const where: any = {};
    if (quarterId) where.quarterId = quarterId as string;
    if (companyId) where.companyId = companyId as string;
    if (departmentId) where.departmentId = departmentId as string;

    // Get all objectives with their key results
    const objectives = await prisma.objective.findMany({
      where,
      include: {
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
        children: {
          include: {
            keyResults: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalObjectives: objectives.length,
      objectivesByLevel: {
        company: objectives.filter(o => o.level === 'COMPANY').length,
        department: objectives.filter(o => o.level === 'DEPARTMENT').length,
        employee: objectives.filter(o => o.level === 'EMPLOYEE').length,
      },
      totalKeyResults: 0,
      averageProgress: 0,
      completionRate: 0,
    };

    let totalProgress = 0;
    let completedKeyResults = 0;

    objectives.forEach(objective => {
      objective.keyResults.forEach(kr => {
        stats.totalKeyResults++;
        const progress = (kr.currentValue / kr.target) * 100;
        totalProgress += progress;
        if (progress >= 100) completedKeyResults++;
      });
    });

    if (stats.totalKeyResults > 0) {
      stats.averageProgress = Math.round(totalProgress / stats.totalKeyResults);
      stats.completionRate = Math.round((completedKeyResults / stats.totalKeyResults) * 100);
    }

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    throw error;
  }
};

export const getOKRHierarchy = async (req: AuthRequest, res: Response) => {
  try {
    const { quarterId, companyId } = req.query;

    const where: any = {
      parentId: null, // Only top-level objectives
    };
    if (quarterId) where.quarterId = quarterId as string;
    if (companyId) where.companyId = companyId as string;

    const hierarchy = await prisma.objective.findMany({
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
        children: {
          include: {
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
            children: {
              include: {
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    throw error;
  }
};

export const getProgressTrend = async (req: AuthRequest, res: Response) => {
  try {
    const { keyResultId } = req.query;

    if (!keyResultId) {
      return res.status(400).json({ error: 'keyResultId is required' });
    }

    const progressUpdates = await prisma.progressUpdate.findMany({
      where: {
        keyResultId: keyResultId as string,
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
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.json({
      success: true,
      data: progressUpdates,
    });
  } catch (error) {
    throw error;
  }
};
