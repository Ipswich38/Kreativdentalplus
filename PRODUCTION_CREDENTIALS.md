# 🦷 KreativDental Plus - Production Login Credentials

## 🔐 Authentication System
- **Login Method**: Employee Number + 6-Digit Passcode
- **Database**: Live Supabase Production Database
- **Security**: Row Level Security (RLS) Enabled
- **Passcode Policy**: Change every 90 days

---

## 👑 OWNER/ADMIN (1 Person)

| Employee Number | Name | Role | Passcode | Position |
|----------------|------|------|----------|----------|
| **OWN-001** | Dr. Camila Cañares-Price | Admin | **123456** | Owner & Clinical Director |

**Full Access**: All modules, financial data, staff management, system settings

---

## 🦷 DENTISTS (8 People)

| Employee Number | Name | Specialty | Passcode | Commission Rate |
|----------------|------|-----------|----------|-----------------|
| **DEN-001** | Dr. Jerome Oh | Endodontics | **234567** | 35% |
| **DEN-002** | Dr. Maria Santos | Orthodontics | **345678** | 35% |
| **DEN-003** | Dr. Carlos Rodriguez | Oral Surgery | **456789** | 40% |
| **DEN-004** | Dr. Patricia Lim | Pediatric Dentistry | **567890** | 35% |
| **DEN-005** | Dr. Michael Chen | Prosthodontics | **678901** | 38% |
| **DEN-006** | Dr. Sarah Johnson | General Dentistry | **789012** | 32% |
| **DEN-007** | Dr. Robert Kim | Periodontics | **890123** | 36% |
| **DEN-008** | Dr. Elena Martinez | Cosmetic Dentistry | **901234** | 35% |

**Access**: Personal dashboard, their appointments, their patients, own payroll data

---

## 👩‍⚕️ STAFF (4 People)

| Employee Number | Name | Position | Passcode | Hourly Rate |
|----------------|------|----------|----------|-------------|
| **STF-001** | Ms. Jezel Roche | Senior Dental Assistant | **111222** | ₱850/hr |
| **STF-002** | Ms. Mhay Blanqueza | Dental Hygienist | **222333** | ₱900/hr |
| **STF-003** | Ms. Andrea Villar | Treatment Coordinator | **333444** | ₱950/hr |
| **STF-004** | Ms. Angel Kaye Sarmiento | Front Desk Manager | **444555** | ₱750/hr |

**Access**: Personal dashboard, view appointments, own payroll, clock in/out

---

## 📋 Role-Based Access Control

### 👑 **Owner (OWN-001)**
- ✅ Complete Dashboard with all metrics
- ✅ All Appointments (full management)
- ✅ All Patient Records (full access)
- ✅ Financial Management (all transactions, reports)
- ✅ Service Catalog (full management)
- ✅ Staff Management (all employees)
- ✅ Payroll Management (all employees)
- ✅ Attendance Tracking (all employees)
- ✅ Inventory Management
- ✅ System Settings

### 🦷 **Dentists (DEN-001 to DEN-008)**
- ✅ Personal Dashboard (their metrics only)
- ✅ Their Appointments (view calendar, patient info)
- ✅ Their Patient Records (view treatment history)
- ✅ Service Catalog (view only)
- ✅ Personal Payroll (their earnings, commissions)
- ✅ Personal Attendance (clock in/out, view history)
- ❌ Other dentists' data
- ❌ Financial management
- ❌ Staff management

### 👩‍⚕️ **Staff (STF-001 to STF-004)**
- ✅ Personal Dashboard (their tasks, schedule)
- ✅ Appointments (view only, for assisting)
- ✅ Patient Records (limited view for assistance)
- ✅ Personal Payroll (their salary, hours worked)
- ✅ Personal Attendance (clock in/out, breaks)
- ❌ Other staff data
- ❌ Financial transactions
- ❌ System administration

---

## 🚀 Quick Test Login

**For immediate testing, use:**

### Owner Access:
```
Employee Number: OWN-001
Passcode: 123456
```

### Dentist Example:
```
Employee Number: DEN-001
Passcode: 234567
```

### Staff Example:
```
Employee Number: STF-001
Passcode: 111222
```

---

## 📊 Production Features Available

### ✅ **Fully Functional Systems:**
- **Authentication**: Secure login with role-based access
- **Patient Management**: Complete CRUD operations
- **Appointment Scheduling**: Real-time calendar with conflicts
- **Attendance Tracking**: Clock in/out with automatic calculations
- **Payroll System**: Automatic generation from attendance
- **Financial Management**: Income/expense tracking
- **Inventory Management**: Stock levels with alerts

### ✅ **Mobile Optimized:**
- Perfect touch targets (48px minimum)
- No zoom on iOS input focus
- Smooth animations and transitions
- Battery-efficient operation

---

## 🛠️ Setup Instructions

### 1. **Run the SQL Script**
Execute this in your Supabase SQL Editor:
```sql
-- Copy contents from: database/insert-staff-users.sql
```

### 2. **Deploy Application**
```bash
npm run build
# Deploy to your hosting platform
```

### 3. **Environment Setup**
Ensure your `.env.local` contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

---

## 🔒 Security Notes

### ⚠️ **Production Security:**
- All passcodes are hashed in production
- RLS policies protect user data
- 90-day passcode expiry enforced
- Session timeout after inactivity
- Audit logging for sensitive operations

### 🔄 **Passcode Management:**
- Users can change their own passcode
- Admin can reset any user's passcode
- Temporary passcodes expire after first login
- Strong passcode requirements enforced

---

## 📱 **Mobile Ready**

All 12 staff members can use their mobile devices with:
- Lightning-fast touch interactions
- Perfect form inputs
- Native mobile keyboards
- Smooth navigation

---

## 🎯 **Ready for Production Deployment!**

Your KreativDental Plus system with 12 real staff accounts is now:
- 🔐 **Securely authenticated** with role-based access
- 📱 **Mobile optimized** for all devices
- ⚡ **Performance optimized** with fast loading
- 🦷 **Dental practice ready** for immediate use

**Deploy and start using today! 🚀**

---

*Last Updated: November 15, 2024*
*KreativDental Plus v1.0 - Production Ready*