# Quick Start Guide - OKR Management System

## Bắt đầu nhanh trong 5 phút

### 1. Cài đặt Dependencies

```bash
# Cài đặt tất cả dependencies
npm install
```

### 2. Setup Database

Đảm bảo PostgreSQL đã được cài đặt và đang chạy.

```bash
# Tạo database
createdb okr_db

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE okr_db;
\q
```

### 3. Cấu hình Backend

```bash
cd backend
cp .env.example .env
```

Cập nhật file `.env` với thông tin database của bạn:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/okr_db?schema=public"
JWT_SECRET="your-super-secret-key-change-this"
PORT=3001
NODE_ENV=development
```

### 4. Khởi tạo Database

```bash
# Vẫn trong thư mục backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Lệnh `prisma:seed` sẽ tạo dữ liệu mẫu:
- 1 công ty: Tech Corp Vietnam
- 3 phòng ban: Engineering, Sales, Marketing
- 5 users với passwords: `password123`
  - admin@techcorp.vn (ADMIN)
  - engineering.head@techcorp.vn (DEPARTMENT_HEAD)
  - sales.head@techcorp.vn (DEPARTMENT_HEAD)
  - employee1@techcorp.vn (EMPLOYEE)
  - employee2@techcorp.vn (EMPLOYEE)
- Các OKRs mẫu với hierarchy đầy đủ

### 5. Cấu hình Frontend

```bash
cd ../frontend
cp .env.example .env
```

File `.env` mặc định:
```env
VITE_API_URL=http://localhost:3001/api
```

### 6. Chạy ứng dụng

Mở 2 terminal:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Hoặc từ thư mục root chạy cả hai cùng lúc:
```bash
npm run dev
```

### 7. Truy cập ứng dụng

Mở trình duyệt và truy cập: **http://localhost:5173**

Đăng nhập với một trong các tài khoản:
- **Admin**: admin@techcorp.vn / password123
- **Dept Head**: engineering.head@techcorp.vn / password123
- **Employee**: employee1@techcorp.vn / password123

## Khám phá tính năng

### Với tài khoản ADMIN
1. Xem **Dashboard** - thống kê tổng quan
2. Vào **OKR Hierarchy** - xem cấu trúc phân cấp
3. Tạo Company-level OKRs mới
4. Quản lý Companies, Departments, Quarters

### Với tài khoản DEPARTMENT_HEAD
1. Xem OKRs của phòng ban
2. Gán Objectives cho nhân viên
3. Vào **Approvals** - phê duyệt progress updates của nhân viên
4. Cập nhật tiến độ của phòng ban

### Với tài khoản EMPLOYEE
1. Vào **My OKRs** - xem OKRs được giao
2. Cập nhật tiến độ cho Key Results
3. Gửi yêu cầu phê duyệt
4. Xem lịch sử phê duyệt

## Troubleshooting

### Database connection error
```bash
# Kiểm tra PostgreSQL đang chạy
sudo service postgresql status
# Hoặc
brew services list | grep postgresql
```

### Port 3001 hoặc 5173 đã được sử dụng
```bash
# Tìm process đang dùng port
lsof -i :3001
lsof -i :5173

# Kill process
kill -9 <PID>
```

### Prisma client not generated
```bash
cd backend
rm -rf node_modules/.prisma
npm run prisma:generate
```

### Dependencies install errors
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm install
```

## Next Steps

1. Đọc [README.md](./README.md) để hiểu chi tiết về hệ thống
2. Khám phá API endpoints tại http://localhost:3001/health
3. Mở Prisma Studio để xem database: `cd backend && npm run prisma:studio`
4. Tùy chỉnh OKR workflow theo nhu cầu của tổ chức

## Workflow Demo

### Tạo và phê duyệt OKR

1. **Login as ADMIN** (admin@techcorp.vn)
   - Tạo Company Objective cho Q2
   - Add Key Results

2. **Login as Dept Head** (engineering.head@techcorp.vn)
   - Tạo Department Objective (child của Company Objective)
   - Gán cho nhân viên

3. **Login as Employee** (employee1@techcorp.vn)
   - Vào "My OKRs"
   - Cập nhật progress
   - Gửi phê duyệt

4. **Back to Dept Head**
   - Vào "Approvals"
   - Xem yêu cầu từ nhân viên
   - Approve hoặc Reject

5. **Check Dashboard**
   - Xem số liệu cập nhật real-time
   - Theo dõi progress trend

Chúc bạn sử dụng vui vẻ! 🚀
