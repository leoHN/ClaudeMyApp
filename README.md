# OKR Management System

Hệ thống quản lý OKR (Objectives and Key Results) cho doanh nghiệp, hỗ trợ quản lý OKR theo 3 cấp: Công ty, Phòng ban, và Nhân viên.

## Tính năng chính

### 1. Quản lý OKR theo cấu trúc tổ chức
- **Cấp công ty (Company-level OKR)**: Các mục tiêu chiến lược của toàn công ty
- **Cấp phòng ban (Department-level OKR)**: OKR của từng phòng ban, do trưởng phòng quản lý
- **Cấp nhân viên (Employee-level OKR)**: OKR cá nhân của từng nhân viên

### 2. Quy trình làm việc hoàn chỉnh
- **Define Objective**: Cấp trên giao objectives cho cấp dưới
- **Nhập Key Results**: Cấp dưới tự định nghĩa key results và cập nhật tiến độ theo quý
- **Phê duyệt**: Cấp trên xem xét và phê duyệt/từ chối kết quả

### 3. Dashboard và Báo cáo
- Thống kê tổng quan OKR của toàn công ty
- Hiển thị cấu trúc phân cấp OKR (hierarchy tree)
- Theo dõi tiến độ và tỷ lệ hoàn thành theo quý
- Visualizations trực quan

## Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **JWT** authentication
- **Zod** validation

### Frontend
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** cho styling
- **React Router** cho routing
- **React Query** cho data fetching
- **Recharts** cho visualizations

## Cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### 1. Clone repository

```bash
git clone <repository-url>
cd ClaudeMyApp
```

### 2. Cài đặt dependencies

```bash
# Cài đặt dependencies cho toàn bộ monorepo
npm install

# Hoặc cài đặt cho từng workspace
cd backend && npm install
cd ../frontend && npm install
```

### 3. Cấu hình Backend

```bash
cd backend
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật file `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/okr_db?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3001
NODE_ENV=development
```

### 4. Khởi tạo Database

```bash
# Tạo Prisma client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate

# (Tùy chọn) Mở Prisma Studio để xem database
npm run prisma:studio
```

### 5. Cấu hình Frontend

```bash
cd ../frontend
```

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

File `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Chạy ứng dụng

### Development Mode

#### Chạy đồng thời Backend và Frontend:

```bash
# Từ thư mục root
npm run dev
```

#### Hoặc chạy riêng lẻ:

**Backend:**
```bash
cd backend
npm run dev
# Server chạy tại http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm run dev
# App chạy tại http://localhost:5173
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Cấu trúc Database

### Models chính:

- **User**: Người dùng với 3 roles (ADMIN, DEPARTMENT_HEAD, EMPLOYEE)
- **Company**: Công ty
- **Department**: Phòng ban
- **Quarter**: Quý (Q1, Q2, Q3, Q4)
- **Objective**: Mục tiêu (3 levels: COMPANY, DEPARTMENT, EMPLOYEE)
- **KeyResult**: Kết quả then chốt
- **ProgressUpdate**: Cập nhật tiến độ
- **Approval**: Phê duyệt (PENDING, APPROVED, REJECTED)

### Quan hệ:

```
Company
  └── Departments
       └── Users

Objective (có thể cascade từ Company → Department → Employee)
  └── KeyResults
       └── ProgressUpdates
            └── Approvals
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Companies
- `GET /api/companies` - Danh sách công ty
- `POST /api/companies` - Tạo công ty (ADMIN only)
- `GET /api/companies/:id` - Chi tiết công ty
- `PUT /api/companies/:id` - Cập nhật công ty (ADMIN only)
- `DELETE /api/companies/:id` - Xóa công ty (ADMIN only)

### Departments
- `GET /api/departments` - Danh sách phòng ban
- `POST /api/departments` - Tạo phòng ban (ADMIN only)
- `GET /api/departments/:id` - Chi tiết phòng ban
- `PUT /api/departments/:id` - Cập nhật phòng ban
- `DELETE /api/departments/:id` - Xóa phòng ban (ADMIN only)

### Quarters
- `GET /api/quarters` - Danh sách quý
- `POST /api/quarters` - Tạo quý (ADMIN only)
- `GET /api/quarters/:id` - Chi tiết quý
- `PUT /api/quarters/:id` - Cập nhật quý (ADMIN only)
- `DELETE /api/quarters/:id` - Xóa quý (ADMIN only)

### Objectives
- `GET /api/objectives` - Danh sách objectives (có filter)
- `POST /api/objectives` - Tạo objective
- `GET /api/objectives/:id` - Chi tiết objective
- `PUT /api/objectives/:id` - Cập nhật objective
- `DELETE /api/objectives/:id` - Xóa objective

### Key Results
- `GET /api/key-results` - Danh sách key results
- `POST /api/key-results` - Tạo key result
- `PUT /api/key-results/:id` - Cập nhật key result
- `POST /api/key-results/:id/progress` - Cập nhật tiến độ
- `DELETE /api/key-results/:id` - Xóa key result

### Approvals
- `GET /api/approvals/pending` - Danh sách chờ phê duyệt
- `POST /api/approvals/:id/review` - Phê duyệt/Từ chối
- `GET /api/approvals/history` - Lịch sử phê duyệt

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/hierarchy` - Cấu trúc phân cấp OKR
- `GET /api/dashboard/progress-trend` - xu hướng tiến độ

## Workflow sử dụng

### 1. Setup ban đầu (ADMIN)

1. Đăng ký tài khoản ADMIN
2. Tạo Company
3. Tạo Departments
4. Tạo Quarters (Q1, Q2, Q3, Q4)
5. Tạo users với các roles khác nhau

### 2. Tạo OKR (Cascade từ trên xuống)

**Bước 1**: ADMIN tạo Company-level Objectives
- Định nghĩa mục tiêu cấp công ty cho quý
- Thêm Key Results cho mỗi objective

**Bước 2**: ADMIN/Department Head gán Objectives cho phòng ban
- Tạo Department-level Objectives (có parent là Company objective)
- Department Head nhập Key Results

**Bước 3**: Department Head gán Objectives cho nhân viên
- Tạo Employee-level Objectives (có parent là Department objective)
- Nhân viên nhập Key Results của riêng mình

### 3. Cập nhật tiến độ (Employees)

1. Nhân viên vào "My OKRs"
2. Nhập giá trị cập nhật cho mỗi Key Result
3. Thêm comment (tùy chọn)
4. Gửi phê duyệt

### 4. Phê duyệt (Department Head / ADMIN)

1. Vào trang "Approvals"
2. Xem danh sách yêu cầu phê duyệt
3. Kiểm tra thông tin:
   - Giá trị hiện tại vs giá trị cập nhật
   - Tiến độ mới
   - Comment của nhân viên
4. Approve hoặc Reject với comment

### 5. Theo dõi Dashboard

- Xem thống kê tổng quan
- Theo dõi tiến độ theo quý
- Xem cấu trúc phân cấp OKR
- Phân tích tỷ lệ hoàn thành

## User Roles và Permissions

### ADMIN
- Toàn quyền quản lý Companies, Departments, Quarters
- Tạo và quản lý Company-level OKRs
- Phê duyệt Company-level progress updates
- Xem tất cả OKRs trong hệ thống

### DEPARTMENT_HEAD
- Quản lý OKRs của phòng ban
- Gán Objectives cho nhân viên
- Phê duyệt progress updates của nhân viên trong phòng
- Xem OKRs của phòng ban

### EMPLOYEE
- Xem OKRs được giao
- Tự nhập Key Results
- Cập nhật tiến độ
- Xem lịch sử phê duyệt của mình

## Troubleshooting

### Database connection error
```bash
# Kiểm tra PostgreSQL đang chạy
sudo service postgresql status

# Kiểm tra DATABASE_URL trong .env
```

### Port already in use
```bash
# Thay đổi PORT trong backend/.env
# Cập nhật VITE_API_URL trong frontend/.env
```

### Prisma client not generated
```bash
cd backend
npm run prisma:generate
```

## Development Notes

### Database Schema Changes

Khi thay đổi Prisma schema:

```bash
cd backend
# Tạo migration
npx prisma migrate dev --name your_migration_name
# Generate client
npm run prisma:generate
```

### Adding new API endpoints

1. Tạo controller trong `backend/src/controllers/`
2. Tạo routes trong `backend/src/routes/`
3. Thêm routes vào `backend/src/index.ts`
4. Cập nhật service trong `frontend/src/services/`

## License

MIT

## Support

Để được hỗ trợ, vui lòng tạo issue trên GitHub repository.
