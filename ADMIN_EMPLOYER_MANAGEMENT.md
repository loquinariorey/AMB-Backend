# 🏢 Admin Employer Management APIs

## Overview
This document describes the admin APIs for managing employers (companies) in the job portal system. These APIs allow administrators to update and delete employer accounts with proper validation and safety checks.

## 🔐 Authentication
All endpoints require admin authentication:
- **Header**: `Authorization: Bearer <admin_jwt_token>`
- **Role**: Admin only

## 📋 Available Endpoints

### 1. Update Employer
**PUT** `/api/employers/:id`

Updates an employer's information. Only admins can update any employer account.

**Request Body:**
```json
{
  "clinic_name": "株式会社サンプル",
  "clinic_name_kana": "カブシキガイシャサンプル",
  "business_form": 1,
  "zip": "123-4567",
  "prefectures": 13,
  "city": "渋谷区",
  "closest_station": "渋谷駅",
  "tel": "03-1234-5678",
  "email": "contact@sample.co.jp",
  "home_page_url": "https://sample.co.jp",
  "access": "渋谷駅から徒歩5分",
  "director_name": "田中太郎",
  "employee_number": 50,
  "establishment_year": "2010",
  "business": "IT・ソフトウェア開発",
  "capital_stock": "1000万円",
  "paying_status": 1,
  "subscription_id": "sub_123456",
  "subscription_regist_date": "20240101",
  "subscription_release_date": "20241231",
  "customer_id": "cust_123456",
  "status": "active"
}
```

**Validation Rules:**
- `clinic_name`: Required, non-empty
- `clinic_name_kana`: Required, non-empty
- `zip`: Required, format: 123-4567
- `tel`: Required, non-empty
- `email`: Required, valid email format
- `prefectures`: Required, integer 1-47 (Japanese prefectures)
- `business_form`: Required, integer 1-3
- `paying_status`: Optional, integer 1-3
- `status`: Optional, one of: 'active', 'inactive', 'suspended'

**Response:**
```json
{
  "success": true,
  "message": "Employer updated successfully",
  "data": {
    "id": 123,
    "clinic_name": "株式会社サンプル",
    "email": "contact@sample.co.jp",
    // ... other fields (password excluded)
  }
}
```

**Error Cases:**
- `404`: Employer not found
- `400`: Validation errors, email already in use by any user type, or email already in use by a job seeker
- `401`: Unauthorized (not admin)
- `403`: Forbidden (not admin)

---

### 2. Delete Employer (Soft Delete)
**DELETE** `/api/employers/:id`

Soft deletes an employer account. The employer will be marked as deleted but data is preserved.

**Safety Checks:**
- Cannot delete if employer has active job postings
- Cannot delete if employer has pending applications
- Prevents data loss and maintains referential integrity

**Request:**
- **URL Parameter**: `id` (employer ID)
- **Body**: None required

**Response:**
```json
{
  "success": true,
  "message": "Employer deleted successfully"
}
```

**Error Cases:**
- `404`: Employer not found
- `400`: Employer already deleted or has active jobs/applications
- `401`: Unauthorized (not admin)
- `403`: Forbidden (not admin)

**Example Error Response:**
```json
{
  "success": false,
  "message": "Cannot delete employer with 5 active job postings. Please deactivate all jobs first."
}
```

---

### 3. Restore Deleted Employer
**PUT** `/api/employers/:id/restore`

Restores a previously deleted employer account.

**Request:**
- **URL Parameter**: `id` (employer ID)
- **Body**: None required

**Response:**
```json
{
  "success": true,
  "message": "Employer restored successfully",
  "data": {
    "id": 123,
    "clinic_name": "株式会社サンプル",
    "deleted": null,
    // ... other fields (password excluded)
  }
}
```

**Error Cases:**
- `404`: Employer not found
- `400`: Employer is not deleted
- `401`: Unauthorized (not admin)
- `403`: Forbidden (not admin)

---

## 🔍 Existing Admin Endpoints

### Get All Employers
**GET** `/api/employers?page=1&limit=10&prefectures=13&searchTerm=サンプル&sortBy=created&sortOrder=DESC`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `prefectures`: Filter by prefecture ID
- `searchTerm`: Search in clinic_name, email, city, business
- `sortBy`: Sort field (default: created)
- `sortOrder`: ASC or DESC (default: DESC)

**Response:**
```json
{
  "success": true,
  "data": {
    "employers": [
      {
        "id": 123,
        "clinic_name": "株式会社サンプル",
        "email": "contact@sample.co.jp",
        "prefectures": 13,
        "created": "2024-01-01T00:00:00.000Z"
        // ... other fields (password excluded)
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

### Get Employer by ID
**GET** `/api/employers/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "clinic_name": "株式会社サンプル",
    "email": "contact@sample.co.jp",
    // ... complete employer data (password excluded)
  }
}
```

### Get Employer List (Simple)
**GET** `/api/employers/infos`

Returns a simple list of all employers with just ID and clinic name.

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 150,
    "employers": [
      {
        "id": 123,
        "clinic_name": "株式会社サンプル"
      }
    ]
  }
}
```

---

## 🛡️ Security Features

### Data Protection
- **Password Exclusion**: All responses exclude password fields
- **Soft Delete**: Deleted employers are marked but not physically removed
- **Email Uniqueness**: Prevents duplicate email addresses across all user types (employers, job seekers, admins)
- **Referential Integrity**: Prevents deletion of employers with active data

### Validation
- **Input Validation**: Comprehensive validation for all fields
- **Business Logic**: Prevents invalid operations (e.g., deleting active employers)
- **Type Safety**: TypeScript ensures type safety

### Error Handling
- **Consistent Error Format**: All errors follow the same response structure
- **Detailed Messages**: Clear error messages for debugging
- **HTTP Status Codes**: Proper HTTP status codes for different error types

---

## 📝 Usage Examples

### Update an Employer
```bash
curl -X PUT http://localhost:3000/api/employers/123 \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "clinic_name": "株式会社サンプル",
    "clinic_name_kana": "カブシキガイシャサンプル",
    "email": "newemail@sample.co.jp",
    "zip": "123-4567",
    "tel": "03-1234-5678",
    "prefectures": 13,
    "business_form": 1
  }'
```

### Delete an Employer
```bash
curl -X DELETE http://localhost:3000/api/employers/123 \
  -H "Authorization: Bearer <admin_token>"
```

### Restore a Deleted Employer
```bash
curl -X PUT http://localhost:3000/api/employers/123/restore \
  -H "Authorization: Bearer <admin_token>"
```

---

## 🔧 Technical Implementation

### Database Schema
The employer model includes all necessary fields for comprehensive company management:
- Basic info: name, email, phone, address
- Business details: form, establishment year, capital stock
- Subscription info: payment status, subscription dates
- System fields: created, modified, deleted timestamps

### Soft Delete Implementation
- Uses `deleted` timestamp field
- Queries automatically exclude deleted records
- Restore functionality available
- Maintains data integrity

### Validation Middleware
- Express-validator for input validation
- Custom validation rules for Japanese business requirements
- Comprehensive error messages
- Type safety with TypeScript

This implementation provides a robust, secure, and user-friendly admin interface for managing employer accounts in the job portal system.
