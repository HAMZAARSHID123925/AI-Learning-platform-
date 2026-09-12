# 03 — AUTH & NEXT.JS INTEGRATION GUIDE
## ELARION Platform — Authentication Architecture, JWT Contract & Frontend Integration

> **Document Type:** Auth & Frontend Integration Specification
> **Primary Audience:** Backend Engineer (Usman) + Frontend Engineer (Next.js)
> **Covers:** JWT design, token lifecycle, RBAC enforcement, Next.js middleware, cookie strategy, SSE auth

---

## 1. Authentication Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Client (Next.js)                              │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐   │
│  │  Next.js        │    │  React State /  │    │  HttpOnly      │   │
│  │  Middleware      │    │  Memory Store   │    │  Cookie        │   │
│  │  (auth check)   │    │  (access token) │    │  (refresh tok) │   │
│  └────────┬────────┘    └────────┬────────┘    └───────┬────────┘   │
│           │                      │                     │            │
└───────────┼──────────────────────┼─────────────────────┼────────────┘
            │                      │                     │
            ▼                      ▼                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend (Module 1)                       │
│                                                                      │
│  POST /auth/login  →  Returns access token (JSON) + sets cookie     │
│  POST /auth/refresh → Reads cookie + returns new access token       │
│  POST /auth/logout  → Revokes refresh token + clears cookie         │
│  All other routes  →  Verify Authorization: Bearer {access_token}   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Token Architecture

### 2.1 Access Token (JWT)

| Property | Value |
|---|---|
| **Algorithm** | RS256 (asymmetric) |
| **TTL** | 15 minutes |
| **Storage** | JavaScript memory only (never `localStorage`, never a cookie) |
| **Rotation** | Issued fresh on every `POST /auth/refresh` call |
| **Verification** | Any service validates using the public RSA key — private key never leaves backend |

#### JWT Payload (Canonical Contract)

```json
{
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "student@elarion.edu",
  "first_name": "Hamza",
  "roles": ["Student"],
  "permissions": [
    "lesson:read",
    "assessment:take",
    "live:join",
    "progress:write"
  ],
  "jti": "unique-token-id-uuid",
  "iat": 1725984000,
  "exp": 1725984900
}
```

**Field definitions:**

| Field | Type | Description |
|---|---|---|
| `sub` | UUID string | User's primary ID |
| `email` | string | User's email (lowercased) |
| `first_name` | string | For display in UI without extra API call |
| `roles` | string[] | Role names (e.g. `["Student"]`, `["Instructor", "Admin"]`) |
| `permissions` | string[] | All permission codes accumulated from all roles |
| `jti` | UUID string | Unique token ID — used for revocation blacklist |
| `iat` | Unix timestamp | Issued at (seconds) |
| `exp` | Unix timestamp | Expiry (iat + 900 seconds) |

**Why include `permissions` in the token:**
- Frontend can read permissions instantly without a round-trip API call
- Next.js middleware can gate entire page routes based on required permissions
- Token is stateless for read operations; backend still validates on every write

---

### 2.2 Refresh Token

| Property | Value |
|---|---|
| **Format** | Cryptographically random 64-byte value, hex-encoded |
| **TTL** | 7 days |
| **Storage** | `HttpOnly; Secure; SameSite=Strict` cookie |
| **Rotation** | Every successful refresh issues a new token and revokes the old one |
| **Storage in DB** | SHA-256 hash only — raw value never stored |
| **Cookie Name** | `elarion_refresh` |

#### Cookie Header (Backend Sets This)

```http
Set-Cookie: elarion_refresh=<raw_token>;
            HttpOnly;
            Secure;
            SameSite=Strict;
            Path=/api/v1/auth;
            Max-Age=604800
```

**Why `Path=/api/v1/auth`:** The cookie is only sent when the browser hits `/api/v1/auth/*` endpoints — specifically `/auth/refresh` and `/auth/logout`. This minimises attack surface.

---

## 3. Login Flow — Step by Step

### Backend: `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "student@elarion.edu",
  "password": "raw_password_here"
}
```

**Backend process:**
1. Normalise email (lowercase, trim)
2. Look up user by email
3. Verify `users.status = 'active'`
4. Verify `users.email_verified = true`
5. Verify `bcrypt.verify(password, users.password_hash)`
6. Collect all permissions via `user_roles → role_permissions → permissions`
7. Build JWT payload (see §2.1)
8. Sign JWT with RSA private key → access token
9. Generate 64-byte random refresh token
10. Store `SHA256(refresh_token)` in `refresh_tokens` table with 7-day expiry
11. Write `elarion:session:{user_id}` to Redis with metadata
12. Write audit log: `user.login`
13. Return access token in JSON body + set refresh cookie

**Response:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "a1b2c3d4-...",
    "email": "student@elarion.edu",
    "first_name": "Hamza",
    "roles": ["Student"]
  }
}
```

**HTTP Status codes:**
- `200 OK` — Success
- `401 Unauthorized` — Invalid credentials (use generic message, never specify which field was wrong)
- `403 Forbidden` — Account suspended
- `429 Too Many Requests` — Rate limit exceeded

---

### Frontend (Next.js): Handling Login Response

```typescript
// lib/auth.ts
export async function login(email: string, password: string) {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    credentials: 'include',  // Required: browser sends/receives cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Login failed')
  }

  const data = await res.json()

  // Store access token in memory ONLY — never localStorage
  setAccessToken(data.access_token)

  return data.user
}

// In-memory token store (module-level variable, not persisted)
let _accessToken: string | null = null

export const setAccessToken = (token: string) => { _accessToken = token }
export const getAccessToken = () => _accessToken
export const clearAccessToken = () => { _accessToken = null }
```

---

## 4. Token Refresh Flow

### When to Refresh

The access token expires every 15 minutes. The frontend must refresh proactively:

**Strategy: Silent refresh via Axios/fetch interceptor**

```typescript
// lib/apiClient.ts
import axios from 'axios'
import { getAccessToken, setAccessToken, clearAccessToken } from './auth'

const api = axios.create({ baseURL: '/api/v1', withCredentials: true })

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, attempt silent refresh
api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }  // Sends the HttpOnly cookie
        )
        setAccessToken(data.access_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)  // Replay the original request
      } catch {
        clearAccessToken()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### Backend: `POST /api/v1/auth/refresh`

**Backend process:**
1. Read `elarion_refresh` cookie from request
2. Compute `SHA256(raw_token)`
3. Look up in `refresh_tokens` where `token_hash = computed_hash` AND `revoked_at IS NULL` AND `expires_at > NOW()`
4. If not found → `401 Unauthorized`
5. Check Redis session registry: if session doesn't exist → `401 Unauthorized` (session was forcibly revoked)
6. Mark old refresh token as revoked (`revoked_at = NOW()`)
7. Issue new refresh token and store its hash
8. Issue new access token
9. Set new cookie
10. Return new access token in JSON

**Response:** Same structure as login response, minus `user` object.

---

## 5. Next.js Middleware (Route Protection)

```typescript
// middleware.ts (at root of Next.js project)
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'  // Lightweight JWT verification in Edge Runtime

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

// Public key loaded from env (RSA public key as JWK or PEM)
const PUBLIC_KEY = await importSPKI(process.env.JWT_PUBLIC_KEY!, 'RS256')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Try to get access token from Authorization header (set by client-side)
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, PUBLIC_KEY)

    // Role-based page gating
    if (pathname.startsWith('/admin') && !payload.roles?.includes('Admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/instructor') && !payload.roles?.includes('Instructor')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Inject user context into request headers for Server Components
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('X-User-Id', payload.sub as string)
    requestHeaders.set('X-User-Roles', JSON.stringify(payload.roles))
    requestHeaders.set('X-User-Permissions', JSON.stringify(payload.permissions))

    return NextResponse.next({ request: { headers: requestHeaders } })
  } catch {
    // Token expired or invalid — redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 6. RBAC — Permission Reference Table

These are all permission codes defined in the system. The frontend can use these to conditionally render UI elements (e.g., hide "Create Course" button if user lacks `course:create`).

| Permission Code | Roles That Have It | What It Guards |
|---|---|---|
| `lesson:read` | Student, Instructor, Admin | Access published lessons |
| `progress:write` | Student | Write lesson completion |
| `assessment:take` | Student | Submit assessment answers |
| `live:join` | Student, Instructor, Admin | Join live sessions |
| `course:create` | Instructor, Admin | Create new courses |
| `course:edit` | Instructor, Admin | Edit course/module/lesson metadata |
| `course:publish` | Instructor, Admin | Publish lessons and courses |
| `live:host` | Instructor, Admin | Create and host live sessions |
| `grade:override` | Instructor, Admin | Manually override AI-assigned grades |
| `user:manage` | Admin | Create, edit, suspend, assign roles to users |
| `skill:manage` | Admin | Create and edit SkillTaxonomy entries |

### Using Permissions in Next.js React Components

```typescript
// hooks/usePermissions.ts
import { useAuth } from '@/contexts/AuthContext'

export function usePermissions() {
  const { user } = useAuth()

  const can = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false
  }

  const canAny = (...permissions: string[]): boolean => {
    return permissions.some(p => can(p))
  }

  return { can, canAny }
}

// Usage in a component:
// const { can } = usePermissions()
// {can('course:create') && <CreateCourseButton />}
```

---

## 7. Server-Sent Events (SSE) Authentication

The SSE stream (`GET /api/v1/students/me/events`) is a long-lived HTTP connection. The browser sends the access token as a query parameter (SSE does not support custom headers in `EventSource`):

```typescript
// Frontend SSE client
function connectSSE(accessToken: string) {
  const url = `/api/v1/students/me/events?token=${encodeURIComponent(accessToken)}`
  const eventSource = new EventSource(url, { withCredentials: true })

  eventSource.addEventListener('test.graded', (event) => {
    const data = JSON.parse(event.data)
    showNotification(`Your ${data.lesson_title} assessment has been graded!`)
    invalidateDashboardCache()
  })

  eventSource.addEventListener('remediation.plan_ready', (event) => {
    const data = JSON.parse(event.data)
    showNotification(`Your personalised remediation plan is ready.`)
    router.refresh()
  })

  eventSource.addEventListener('live.starting', (event) => {
    const data = JSON.parse(event.data)
    showNotification(`Live class "${data.session_title}" starts in 5 minutes!`)
  })

  // Auto-reconnect: EventSource reconnects automatically on disconnect
  // Re-auth: If 401 returned, the EventSource closes; re-open with fresh token
  eventSource.onerror = async () => {
    eventSource.close()
    await silentRefresh()  // Re-issue access token
    connectSSE(getAccessToken()!)  // Reconnect with fresh token
  }

  return eventSource
}
```

**Backend SSE handler (FastAPI):**

```python
# The backend validates the `?token=` query param as a JWT
# and streams events from Redis `elarion:sse:student:{student_id}`
```

---

## 8. Logout Flow

```typescript
// Frontend
async function logout() {
  await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',  // Sends refresh cookie for revocation
  })

  clearAccessToken()
  // Backend clears the cookie via Set-Cookie: elarion_refresh=; Max-Age=0
  window.location.href = '/login'
}
```

**Backend process:**
1. Read refresh cookie
2. Mark `refresh_tokens.revoked_at = NOW()` for this token
3. Delete Redis session key `elarion:session:{user_id}`
4. Add `jti` of current access token to Redis blacklist with TTL = remaining token lifetime
5. Clear cookie: `Set-Cookie: elarion_refresh=; Max-Age=0; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`
6. Write audit log: `user.logout`
7. Return `204 No Content`

---

## 9. Environment Variables Required

### Backend (.env)

```env
# JWT - RSA Key Pair (generate with: openssl genrsa -out private.pem 2048)
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
JWT_ALGORITHM=RS256

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/elarion

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS (Next.js frontend origin)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://app.elarion.edu
```

### Frontend (.env.local)

```env
# API Base URL (proxied through Next.js rewrites to avoid CORS issues in production)
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Public Key (for middleware token verification in Edge Runtime)
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBg..."
```

---

## 10. Security Checklist

| Check | Where Enforced | How to Verify |
|---|---|---|
| Access token NOT in localStorage | Frontend `auth.ts` | Inspect browser DevTools → Application → Storage |
| Refresh token HttpOnly cookie | Backend `Set-Cookie` header | DevTools → Network → Response Headers → Set-Cookie |
| Refresh token has `SameSite=Strict` | Backend `Set-Cookie` header | Same as above |
| All protected routes require valid JWT | FastAPI dependency | Call endpoint without token → expect `401` |
| Suspended users cannot access any route | Backend `get_current_user` dependency | Suspend a user in DB → their next request → `403` |
| RBAC checked at route level, not just UI | FastAPI route dependencies | Call admin endpoint with a Student JWT → expect `403` |
| Rate limiting on login | Redis counter middleware | Hit login 6 times in 15 min → expect `429` |
| JWT `jti` blacklisted after logout | Redis `blacklist:jwt:{jti}` | Log out → replay old access token → expect `401` |
| Refresh token rotation invalidates old token | DB `revoked_at` | Use old refresh token after refresh → expect `401` |

---

*For detailed RBAC FastAPI dependency implementation, see the backend source code in `backend/app/shared/auth.py`.*
*For SSE implementation details, see `05-ADAPTIVE-LOOP-AND-EVENTS.md §6`.*
