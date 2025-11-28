# 🔐 Quick Start - Admin Authentication

## Setup (1 minute)

```bash
# 1. Install dependencies (if needed)
npm install bcryptjs

# 2. Create admin accounts
npm run setup-admin

# 3. Start server
npm run dev
```

## Login & Get Token (Test in Postman/cURL)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "ADMIN001",
    "password": "Admin@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "adminId": "ADMIN001",
      "name": "Admin User",
      "email": "admin@epasaley.com",
      "role": "super_admin"
    }
  }
}
```

## Use Token for Admin Operations

Copy the token and add to Authorization header:

```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices",
    "slug": "electronics"
  }'
```

## Default Credentials

| Role | Admin ID | Email | Password |
|------|----------|-------|----------|
| Super Admin | ADMIN001 | admin@epasaley.com | Admin@123 |
| Manager | ADMIN002 | manager@epasaley.com | Manager@123 |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login with ID + password → get token |
| GET | `/api/v1/auth/profile` | Get admin profile |
| PUT | `/api/v1/auth/password` | Change password |
| POST | `/api/v1/auth/logout` | Logout |

### Admin-Only Operations (require token)

| Method | Endpoint | Resource |
|--------|----------|----------|
| POST | `/api/v1/categories` | Create category |
| PUT | `/api/v1/categories/:id` | Update category |
| DELETE | `/api/v1/categories/:id` | Delete category |
| POST | `/api/v1/products` | Create product |
| POST | `/api/v1/coupons` | Create coupon |
| POST | `/api/v1/banners` | Create banner |
| POST | `/api/v1/flash-sales` | Create flash sale |

## Token Format

**Header:** `Authorization: Bearer <token>`

**Token Duration:** 7 days

**Token Contains:**
- Admin ID
- Email
- Role (admin/super_admin)
- Issued timestamp
- Expiration timestamp

## React Integration

```typescript
// 1. Login
const response = await fetch('http://localhost:5000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminId: 'ADMIN001',
    password: 'Admin@123'
  })
});

const { data: { token } } = await response.json();

// 2. Store token
localStorage.setItem('authToken', token);

// 3. Use token in requests
const token = localStorage.getItem('authToken');
const categoryResponse = await fetch('http://localhost:5000/api/v1/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Electronics',
    description: 'Electronic devices'
  })
});
```

## Error Responses

| Status | Message | Fix |
|--------|---------|-----|
| 400 | Admin ID and password required | Provide both fields |
| 401 | Invalid admin ID or password | Check credentials |
| 401 | Admin account is inactive | Contact super admin |
| 401 | No token provided | Add Authorization header |
| 403 | Admin access required | Login with admin account |

## Common Issues

**Q: "Invalid admin ID or password"**  
A: Run `npm run setup-admin` to create default accounts

**Q: "Module not found: bcryptjs"**  
A: Run `npm install bcryptjs`

**Q: "Token expired"**  
A: Login again to get new token (expires in 7 days)

**Q: 401 error on protected endpoint**  
A: Verify token in Authorization header: `Bearer <token>`

## File Structure

```
src/
├── models/
│   └── Admin.ts              ← Admin schema
├── controllers/
│   └── auth.controller.ts    ← Login logic
├── routes/
│   ├── auth.routes.ts        ← Auth endpoints
│   └── index.ts              ← Route mounting
├── middlewares/
│   └── authMiddleware.ts     ← Token verification (existing)
└── utils/
    └── tokenGenerator.ts     ← Token generation (existing)
```

## Database

Admin stored in MongoDB collection: `admins`

Fields:
- `adminId` - Unique identifier (ADMIN001, etc.)
- `email` - Admin email
- `password` - Hashed password
- `name` - Admin name
- `role` - admin or super_admin
- `isActive` - Enable/disable account
- `lastLogin` - Last login timestamp

## Production Checklist

- ✅ Update `.env` with strong JWT secrets
- ✅ Change default passwords
- ✅ Use HTTPS only
- ✅ Enable CORS properly
- ✅ Add rate limiting for login
- ✅ Implement refresh token (optional)
- ✅ Set up logging
- ✅ Test 401/403 error handling

## References

- **Full API Doc:** `AUTH_API.md`
- **Implementation Details:** `AUTH_IMPLEMENTATION.md`
- **Admin Model:** `src/models/Admin.ts`
- **Auth Controller:** `src/controllers/auth.controller.ts`
- **Routes:** `src/routes/auth.routes.ts`

---

**Status:** ✅ Ready to use  
**Last Updated:** 2025-11-28  
**API Version:** v1
