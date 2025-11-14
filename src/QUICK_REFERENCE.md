# kreativDental Plus - Quick Reference Card

## 🔐 Quick Login Credentials

### Copy & Paste for Testing:

**Admin (Full Access):**
```
Employee ID: ADM-001
Passcode: 100001
```

**Dentist/Owner:**
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

## 👥 All Demo Accounts

| Employee ID | Name | Role | Passcode |
|------------|------|------|----------|
| **ADM-001** | System Administrator | Admin | **100001** |
| **DEN-001** | DRA. CAMILA CAÑARES-PRICE | Dentist | **200001** |
| **DEN-002** | DR. JEROME OH | Dentist | **200002** |
| **DEN-003** | DR. MARIA SANTOS | Dentist | **200003** |
| **STF-001** | MS. JEZEL ROCHE | Staff | **300001** |
| **STF-002** | MS. MHAY BLANQUEZA | Staff | **300002** |
| **STF-003** | MS. ANDREA VILLAR | Staff | **300003** |
| **STF-004** | MS. ANGEL KAYE SARMIENTO | Staff | **300004** |
| **STF-005** | MR. JAMES RIVERA | Staff | **300005** |
| **REC-001** | MS. LISA MARTINEZ | Receptionist | **400001** |

---

## 🎯 Role Access Quick View

### Admin (ADM-001)
- ✅ All 9 navigation items
- ✅ System overview dashboard
- ✅ Full CRUD on all entities

### Dentist (DEN-001, DEN-002, DEN-003)
- ✅ 6 navigation items
- ✅ Personal dashboard
- ✅ Own appointments & patients only

### Staff (STF-001 to STF-005)
- ✅ 4 navigation items
- ✅ Personal payroll dashboard
- ✅ View-only access

### Receptionist (REC-001)
- ✅ 5 navigation items
- ✅ Appointment management dashboard
- ✅ Front desk operations

---

## 📂 Key Files

### Authentication & Users
- `/data/users.ts` - User database & auth functions
- `/components/LoginPage.tsx` - Login interface
- `/App.tsx` - Main app with auth flow

### Dashboards
- `/components/AdminDashboard.tsx` - Admin view
- `/components/DentistDashboard.tsx` - Dentist view
- `/components/StaffDashboard.tsx` - Staff view
- `/components/ReceptionistDashboard.tsx` - Receptionist view

### Layout
- `/components/MainLayout.tsx` - Main layout with RBAC navigation

### Documentation
- `/PRODUCTION_CREDENTIALS.md` - Full credentials guide
- `/IMPLEMENTATION_SUMMARY.md` - Technical documentation
- `/CHANGES_LOG.md` - All changes made

---

## 🔧 Common Commands

### Test Login Flow
1. Open application
2. Enter Employee ID (e.g., `ADM-001`)
3. Enter Passcode (e.g., `100001`)
4. Click "Sign In"
5. Verify role-specific dashboard loads

### Test Different Roles
```bash
# Admin Access
Login: ADM-001 / 100001
Expected: Full system dashboard with 9 nav items

# Dentist Access
Login: DEN-001 / 200001
Expected: Personal dashboard with appointments, 6 nav items

# Staff Access
Login: STF-001 / 300001
Expected: Payroll dashboard with 4 nav items

# Receptionist Access
Login: REC-001 / 400001
Expected: Appointment dashboard with 5 nav items
```

---

## 🎨 UI Components Used

### From ShadCN:
- Card, CardContent, CardHeader, CardTitle
- Input, Label, Button
- Badge, Avatar, AvatarFallback
- Alert, AlertDescription
- Select, Textarea, Dialog
- Toaster (from sonner)

### Custom Dashboards:
- StatCard component (in each dashboard)
- ActivityItem component
- StatusBadge component

---

## 🔒 Security Features

✅ Employee ID validation  
✅ 6-digit passcode enforcement  
✅ Passcode expiration (30 days)  
✅ Role-based access control  
✅ Last login tracking  
✅ Input sanitization  

⚠️ **For Production:** Add password hashing, JWT, rate limiting, 2FA

---

## 💡 Quick Tips

### Employee ID Format:
- Admin: `ADM-XXX`
- Dentist: `DEN-XXX`
- Staff: `STF-XXX`
- Receptionist: `REC-XXX`

### Passcode Format:
- Exactly 6 digits
- No letters or special characters
- Demo: 100001 (Admin), 200001 (Dentist), 300001 (Staff), 400001 (Receptionist)

### Navigation:
- More items = Higher access level
- Admin sees all 9 items
- Staff sees only 4 items

### Dashboard Colors:
- Purple/Pink: Main branding
- Emerald/Green: kreativPayroll section
- Role-specific: Each dashboard customized

---

## 📞 Need Help?

1. **Credentials:** See `PRODUCTION_CREDENTIALS.md`
2. **Technical:** See `IMPLEMENTATION_SUMMARY.md`
3. **Changes:** See `CHANGES_LOG.md`
4. **This Guide:** Quick reference for testing

---

## ✅ Quick Verification

After making changes, verify:
- [ ] Login works with all 4 role types
- [ ] Each role sees correct navigation items
- [ ] Each role sees correct dashboard
- [ ] User info displays in sidebar
- [ ] Logout returns to login page
- [ ] Toast notifications appear
- [ ] Invalid credentials show error

---

*Keep this file open during development for quick credential access!*
