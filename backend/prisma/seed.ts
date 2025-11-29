import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Company
  const company = await prisma.company.create({
    data: {
      name: 'Tech Corp Vietnam',
      description: 'Leading technology company in Vietnam',
    },
  })
  console.log('✅ Created company:', company.name)

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Engineering',
        companyId: company.id,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Sales',
        companyId: company.id,
      },
    }),
    prisma.department.create({
      data: {
        name: 'Marketing',
        companyId: company.id,
      },
    }),
  ])
  console.log('✅ Created departments:', departments.map(d => d.name).join(', '))

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@techcorp.vn',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin:', admin.email)

  const deptHead1 = await prisma.user.create({
    data: {
      email: 'engineering.head@techcorp.vn',
      password: hashedPassword,
      name: 'Nguyễn Văn A',
      role: 'DEPARTMENT_HEAD',
      departmentId: departments[0].id,
    },
  })

  const deptHead2 = await prisma.user.create({
    data: {
      email: 'sales.head@techcorp.vn',
      password: hashedPassword,
      name: 'Trần Thị B',
      role: 'DEPARTMENT_HEAD',
      departmentId: departments[1].id,
    },
  })

  const employee1 = await prisma.user.create({
    data: {
      email: 'employee1@techcorp.vn',
      password: hashedPassword,
      name: 'Lê Văn C',
      role: 'EMPLOYEE',
      departmentId: departments[0].id,
    },
  })

  const employee2 = await prisma.user.create({
    data: {
      email: 'employee2@techcorp.vn',
      password: hashedPassword,
      name: 'Phạm Thị D',
      role: 'EMPLOYEE',
      departmentId: departments[1].id,
    },
  })

  console.log('✅ Created users')

  // Create Quarters
  const currentYear = new Date().getFullYear()
  const quarters = await Promise.all([
    prisma.quarter.create({
      data: {
        name: `Q1 ${currentYear}`,
        year: currentYear,
        quarter: 1,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-03-31`),
      },
    }),
    prisma.quarter.create({
      data: {
        name: `Q2 ${currentYear}`,
        year: currentYear,
        quarter: 2,
        startDate: new Date(`${currentYear}-04-01`),
        endDate: new Date(`${currentYear}-06-30`),
      },
    }),
    prisma.quarter.create({
      data: {
        name: `Q3 ${currentYear}`,
        year: currentYear,
        quarter: 3,
        startDate: new Date(`${currentYear}-07-01`),
        endDate: new Date(`${currentYear}-09-30`),
      },
    }),
    prisma.quarter.create({
      data: {
        name: `Q4 ${currentYear}`,
        year: currentYear,
        quarter: 4,
        startDate: new Date(`${currentYear}-10-01`),
        endDate: new Date(`${currentYear}-12-31`),
      },
    }),
  ])
  console.log('✅ Created quarters for', currentYear)

  // Create Company-level Objective
  const companyObjective = await prisma.objective.create({
    data: {
      title: 'Tăng trưởng doanh thu 50% trong năm',
      description: 'Mục tiêu chiến lược của công ty cho Q1',
      level: 'COMPANY',
      quarterId: quarters[0].id,
      companyId: company.id,
      assignedById: admin.id,
      keyResults: {
        create: [
          {
            title: 'Đạt doanh thu 10 tỷ VNĐ',
            description: 'Tổng doanh thu từ tất cả sản phẩm',
            target: 10,
            unit: 'tỷ VNĐ',
            currentValue: 6.5,
          },
          {
            title: 'Tăng số lượng khách hàng lên 1000',
            target: 1000,
            unit: 'khách hàng',
            currentValue: 650,
          },
        ],
      },
    },
  })
  console.log('✅ Created company objective')

  // Create Department-level Objective
  const deptObjective = await prisma.objective.create({
    data: {
      title: 'Phát triển 5 tính năng mới cho sản phẩm chính',
      description: 'Mục tiêu của phòng Engineering',
      level: 'DEPARTMENT',
      quarterId: quarters[0].id,
      departmentId: departments[0].id,
      parentId: companyObjective.id,
      assignedById: admin.id,
      keyResults: {
        create: [
          {
            title: 'Hoàn thành 5 features',
            target: 5,
            unit: 'features',
            currentValue: 3,
          },
          {
            title: 'Code coverage đạt 80%',
            target: 80,
            unit: '%',
            currentValue: 65,
          },
        ],
      },
    },
  })
  console.log('✅ Created department objective')

  // Create Employee-level Objective
  const employeeObjective = await prisma.objective.create({
    data: {
      title: 'Phát triển module Authentication',
      description: 'Hoàn thành module đăng nhập với OAuth2',
      level: 'EMPLOYEE',
      quarterId: quarters[0].id,
      userId: employee1.id,
      parentId: deptObjective.id,
      assignedById: deptHead1.id,
      keyResults: {
        create: [
          {
            title: 'Hoàn thành Authentication với Google/Facebook',
            target: 2,
            unit: 'providers',
            currentValue: 1,
          },
          {
            title: 'Viết unit tests với coverage >= 90%',
            target: 90,
            unit: '%',
            currentValue: 75,
          },
        ],
      },
    },
  })
  console.log('✅ Created employee objective')

  // Create some progress updates and approvals
  const keyResults = await prisma.keyResult.findMany({
    where: { objectiveId: employeeObjective.id },
  })

  for (const kr of keyResults) {
    const progressUpdate = await prisma.progressUpdate.create({
      data: {
        value: kr.currentValue,
        comment: 'Cập nhật tiến độ tuần này',
        keyResultId: kr.id,
        userId: employee1.id,
      },
    })

    await prisma.approval.create({
      data: {
        status: 'APPROVED',
        comment: 'Tốt lắm! Tiếp tục phát huy',
        progressUpdateId: progressUpdate.id,
        keyResultId: kr.id,
        approverId: deptHead1.id,
      },
    })
  }
  console.log('✅ Created progress updates and approvals')

  console.log('🎉 Seed completed!')
  console.log('\n📋 Test accounts:')
  console.log('Admin: admin@techcorp.vn / password123')
  console.log('Dept Head (Engineering): engineering.head@techcorp.vn / password123')
  console.log('Dept Head (Sales): sales.head@techcorp.vn / password123')
  console.log('Employee 1: employee1@techcorp.vn / password123')
  console.log('Employee 2: employee2@techcorp.vn / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
