# 📝 Frontend API Changes Summary

## 🎯 What Changed for Frontend Developers

### Existing APIs - New Fields Added

#### GET `/api/columns?page=1&limit=10&category=ブランド`
**✅ Still works exactly the same!**

**New fields in response:**
```json
{
  "data": {
    "articles": [
      {
        "id": 123,
        "title": "記事タイトル",
        "category": "ブランド",
        "custom_id": "SPECIAL-001",    // ← NEW (可能為 null)
        "is_published": true,          // ← NEW (always true for public API)
        "content": "...",
        "view_cnt": 150,
        // ... existing fields unchanged
      }
    ]
  }
}
```

#### GET `/api/columns/123` or `/api/columns/SPECIAL-001`
**✅ Both work now!**
- `/api/columns/123` - original numeric ID
- `/api/columns/SPECIAL-001` - new custom ID

---

## 🆕 New Admin API (Only for Admin Panel)

### GET `/api/columns/admin?is_published=false`
**For admin panel only** - shows ALL articles (published + unpublished)

**Query Parameters:**
- `page`, `limit`, `category`, `searchTerm` - same as before
- `is_published` - new filter: "true"/"false"/undefined for all

---

## 📋 For Create/Update Forms (Admin Only)

### POST/PUT `/api/columns/123`
**New optional fields to add to your forms:**

```javascript
const formData = new FormData();
formData.append('title', '記事タイトル');
formData.append('category', 'ブランド');
formData.append('content', '内容...');

// NEW OPTIONAL FIELDS:
formData.append('custom_id', 'SPECIAL-001');  // Optional custom ID
formData.append('is_published', 'false');     // Optional: true/false (default: true)

// Existing fields work the same:
formData.append('thumbnail', fileObject);
```

---

## ⚡ What to Update in Frontend

### 1. Article Links (Optional Enhancement)
```javascript
// Before:
const articleUrl = `/articles/${article.id}`;

// After (Enhanced):
const articleUrl = `/articles/${article.custom_id || article.id}`;
```

### 2. Admin Forms (Add 2 Fields)
```html
<!-- Add to create/edit forms -->
<input name="custom_id" placeholder="Custom ID (optional)" />
<input type="checkbox" name="is_published" checked /> Publish
```

### 3. Admin Article List (Show Status)
```javascript
// Show publication status in admin
{article.is_published ? '公開' : '非公開'}
```

### 4. Toggle Publication Status
```javascript
// Toggle article visibility
const toggleStatus = async (articleId, currentStatus) => {
  const formData = new FormData();
  formData.append('is_published', !currentStatus);
  
  await fetch(`/api/columns/${articleId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` },
    body: formData
  });
};
```

---

## 🎯 Quick Summary

**✅ Existing frontend code works unchanged**  
**✅ Just add 2 optional fields to admin forms**  
**✅ Optionally enhance URLs to use custom_id**  

**That's it!** 🚀

The complex stuff is all handled in the backend. Frontend developers just need to:
1. Add 2 form fields for admin
2. Optionally use `custom_id` for prettier URLs  
3. Display publication status in admin panel

Everything else works exactly the same as before!

---

## 📚 Same Changes Apply To:

- **Columns API**: `/api/columns/*`
- **Interviews API**: `/api/interviews/*`

Both have identical new features and field structure.
