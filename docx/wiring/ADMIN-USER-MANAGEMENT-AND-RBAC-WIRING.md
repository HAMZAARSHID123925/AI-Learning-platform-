# Admin User Management, RBAC & Status Wiring Specification

## 1. Architecture Overview
This document specifies the end-to-end integration between the **Pen & Page Academia Admin Studio** (`/admin/courses?tab=users`) and the **FastAPI RBAC Service** (`backend/app/modules/module1_auth`).

All mock/dummy student and staff datasets (`INITIAL_USERS`, hardcoded faculty, dummy mock bands) have been completely removed. The Admin Studio now displays real database accounts registered in the PostgreSQL `users`, `roles`, and `user_roles` tables.

```
┌────────────────────────────────────────────────────────┐
│               Admin Studio UI                          │
│        /admin/courses?tab=users                        │
│                                                        │
│  [All Accounts (4)] [Students (2)] [Instructors (2)]   │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
       GET /api/v1/users?page_size=100
       PATCH /api/v1/users/{id}           (Status: active | suspended)
       POST /api/v1/users/{id}/roles      (Assign role)
       DELETE /api/v1/users/{id}/roles/.. (Revoke role)
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Backend (Module 1 Auth)            │
│            RBAC Guard: require_any_role("Admin")        │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│               PostgreSQL Database                      │
│            `users` + `roles` + `user_roles`            │
└────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints

### 2.1 Fetch Users (`GET /api/v1/users`)
- **Authorization:** `Bearer <Admin JWT>`
- **Query Parameters:** `page=1&page_size=100`
- **Response Model:** `PaginatedResponse[UserResponse]`
- **Sample Response:**
```json
{
  "items": [
    {
      "id": "7dbbf4fd-7318-4ebf-9da8-350fa2089432",
      "email": "student@elarion.com",
      "first_name": "Elarion",
      "last_name": "Student",
      "status": "active",
      "roles": ["Student"],
      "created_at": "2026-09-17T03:11:36.364351Z"
    }
  ],
  "total": 4,
  "page": 1,
  "page_size": 100
}
```

### 2.2 Suspend or Activate Account (`PATCH /api/v1/users/{user_id}`)
- **Authorization:** `Bearer <Admin JWT>`
- **Request Body:**
```json
{
  "status": "suspended" // or "active"
}
```
- **DB Effect:** Updates `users.status`, instantly revoking access or restoring platform privileges.

### 2.3 Role Assignment & Migration (`POST` & `DELETE`)
- **Assign New Role:** `POST /api/v1/users/{user_id}/roles` with `{"role_name": "Instructor"}`
- **Revoke Prior Role:** `DELETE /api/v1/users/{user_id}/roles/{old_role_name}`
- **Audit Logging:** Every role change is recorded in PostgreSQL `audit_logs` table (`action="role.assigned"` / `"role.revoked"`).

---

## 3. UI Features & Empty State Behavior

1. **Sub-Tab Navigation:**
   - **All Accounts ({total})**: Shows all platform users.
   - **Students ({total})**: Filters by users having role `Student`.
   - **Certified Instructors ({total})**: Filters by users having role `Instructor`.
   - **Pending Teacher Invites ({total})**: Outbound onboarding invitation links.
2. **Clean Empty States:**
   - If 0 students exist, displays: *"No student accounts currently exist in PostgreSQL. When learners register, they will appear here with real join dates and statuses."*
   - Avoids falling back to fake mock users.
3. **Live Target Band & Assessment Status:**
   - Admin accounts display: `System Admin`
   - Instructor accounts display: `Faculty`
   - Students without completed exam/diagnostics display: `Not Assessed (No Bands Yet)`
4. **Live Actions:**
   - Status toggle: Immediately updates `users.status` in PostgreSQL between `ACTIVE` and `SUSPENDED`.
   - Role dropdown: Seamlessly reassigns roles in PostgreSQL.

---

## 4. Verification & Testing

### Verification Command (PostgreSQL Direct Query):
```powershell
docker exec elarion_postgres psql -U elarion_user -d elarion -c "SELECT u.id, u.email, u.status, u.created_at, r.name as role FROM users u JOIN user_roles ur ON u.id = ur.user_id JOIN roles r ON ur.role_id = r.id ORDER BY u.created_at ASC;"
```

### Automated API Test:
```powershell
python backend/scripts/test_admin_users.py
```
Outputs:
```
Target student ID: e894c9da-ecec-4832-a797-42307fd1f3cc, current status: active
Updated status in DB: suspended
Reactivated status in DB: active
ALL ADMIN USER STATUS TESTS PASSED SUCCESSFULLY!
```
