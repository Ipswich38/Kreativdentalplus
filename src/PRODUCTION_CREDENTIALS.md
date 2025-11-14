# kreativDental Plus - Production Demo Credentials

## Authentication System
- **Login Method**: Employee ID + 6-Digit Passcode
- **Passcode Policy**: Temporary passcodes must be changed after 30 days
- **Access Control**: Role-Based Access Control (RBAC)

---

## Admin Access

| Employee ID | Name | Role | Passcode | Notes |
|------------|------|------|----------|-------|
| **ADM-001** | System Administrator | Admin | **100001** | Full system access |

---

## Dentists Access (8 Total)

| Employee ID | Name | Specialty | Passcode | Notes |
|------------|------|-----------|----------|-------|
| **DEN-001** | DRA. CAMILA CAÑARES-PRICE | Owner & Founder | **200001** | Full access to all dental features |
| **DEN-002** | DR. JEROME OH | Oral Surgeon | **200002** | Personal dashboard + appointments |
| **DEN-003** | DRA. CLENCY | Pediatric Dentistry | **200003** | Personal dashboard + appointments |
| **DEN-004** | DRA. FATIMA PORCIUNCULA | Orthodontics | **200004** | Personal dashboard + appointments |
| **DEN-005** | DRA. FEVI STELLA TORRALBA-PIO | General Dentistry | **200005** | Personal dashboard + appointments |
| **DEN-006** | DR. JONATHAN PINEDA | TMJ Specialist | **200006** | Personal dashboard + appointments |
| **DEN-007** | DR. FELIPE SUPILANA | Implant Specialist | **200007** | Personal dashboard + appointments |
| **DEN-008** | DRA. SHIRLEY BAYOG | Cosmetic Dentistry | **200008** | Personal dashboard + appointments |

---

## Staff Access (4 Total)

| Employee ID | Name | Position | Passcode | Notes |
|------------|------|----------|----------|-------|
| **STF-001** | MS. JEZEL ROCHE | Front-Desk Staff | **300001** | Limited dashboard access |
| **STF-002** | MS. MHAY BLANQUEZA | Dental Assistant, Treatment Coordinator | **300002** | Personal payroll view |
| **STF-003** | MS. EDNA TATIMO | Lead Dental Assistant | **300003** | Personal payroll view |
| **STF-004** | MICH BLASCO | Admin, Editor | **300004** | Personal payroll view |

---

## Receptionist Access

| Employee ID | Name | Position | Passcode | Notes |
|------------|------|----------|----------|-------|
| **REC-001** | MS. LISA MARTINEZ | Receptionist | **400001** | Appointments + patient records |

---

## Role Access Matrix

### Admin (ADM-001)
- ✅ Full Dashboard with all metrics
- ✅ All Appointments (view, create, edit, delete)
- ✅ All Patient Records (full CRUD)
- ✅ Financial Management (all transactions)
- ✅ Service Catalog (full management)
- ✅ Dentists Management (view, add, edit)
- ✅ kreativPayroll (all employees, full access)
- ✅ Attendance (all employees)
- ✅ Inventory Management
- ✅ Settings & Configuration

### Dentists (DEN-001 to DEN-008)
- ✅ Personal Dashboard (their appointments, patients, earnings)
- ✅ Their Appointments only
- ✅ Their Patient Records
- ✅ Service Catalog (view only)
- ✅ Personal kreativPayroll (their earnings, commissions)
- ✅ Personal Attendance
- ❌ Other dentists' data
- ❌ Staff management
- ❌ System settings

### Staff (STF-001 to STF-004)
- ✅ Personal Dashboard (their tasks, attendance)
- ✅ Appointments (view only, assisting tasks)
- ✅ Patient Records (view only)
- ✅ Personal kreativPayroll (their salary, commissions)
- ✅ Personal Attendance
- ❌ Financial management
- ❌ Service catalog editing
- ❌ Other staff data
- ❌ System settings

### Receptionist (REC-001)
- ✅ Dashboard (appointments overview)
- ✅ Appointments (create, view, edit)
- ✅ Patient Records (create, view, edit)
- ✅ Service Catalog (view only)
- ✅ Personal kreativPayroll (view only)
- ❌ Financial transactions
- ❌ Dentist management
- ❌ Staff management
- ❌ Inventory

---

## Complete Credentials Summary

**Total: 14 Accounts**
- 1 Admin Account
- 8 Dentist Accounts
- 4 Staff Accounts
- 1 Receptionist Account

---

## Passcode Change Policy

All users must change their temporary passcode within **30 days** of first login.

### Passcode Requirements:
- Must be exactly 6 digits
- Cannot reuse last 3 passcodes
- No sequential numbers (e.g., 123456)
- No repeated digits (e.g., 111111)

---

## Security Notes

⚠️ **IMPORTANT**: 
- This is a **demo/development environment**
- All credentials shown here are for **testing purposes only**
- In production, implement proper password hashing (bcrypt/argon2)
- Enable 2FA for admin accounts
- Implement proper session management
- Add audit logging for sensitive operations
- Use HTTPS for all communications

---

## Quick Login Testing

For quick testing during development, copy these credentials:

**Admin:**
```
Employee ID: ADM-001
Passcode: 100001
```

**Dentist (Owner):**
```
Employee ID: DEN-001
Passcode: 200001
```

**Staff:**
```
Employee ID: STF-001
Passcode: 300001
```

**Receptionist:**
```
Employee ID: REC-001
Passcode: 400001
```

---

*Last Updated: November 14, 2025*
*kreativDental Plus v1.0 - Production Ready*
