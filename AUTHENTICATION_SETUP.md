# Iroto Realty Admin Authentication Setup

## 🔐 Authentication System Overview

The admin panel now has a complete authentication system with role-based access control. Only users with 'admin' or 'super_admin' roles can access the admin panel.

## 📋 Setup Instructions

### 1. Deploy Database Schema

**IMPORTANT:** You must run the new authentication schema in your Supabase SQL editor.

1. Go to your Supabase project: https://phgqytmdpwivkkkhawyj.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/01-auth.sql`
4. Click **Run** to execute the script

This will create:
- `user_roles` table for managing user permissions
- Helper functions for role checking (`is_admin()`, `is_super_admin()`, etc.)
- Updated RLS policies that use role-based access
- Auto-trigger to create user roles when users sign up

### 2. Access the Admin Panel

#### For New Users:
1. Go to `/login` page
2. **Hidden Signup**: Click the "IR" logo **5 times** to reveal signup option
3. Create account with email/password
4. Account will be created with 'user' role (no admin access)
5. Contact super admin to upgrade role

#### For Existing Users:
1. Go to `/login` page  
2. Sign in with email/password
3. If you have admin role, you'll be redirected to `/properties`
4. If you don't have admin role, you'll see "Access denied" message

## 🔧 Managing User Roles

### Promote User to Admin (via SQL Editor):
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE email = 'libanjoe7@gmail.com';
no ```

### Promote User to Super Admin:
```sql
UPDATE user_roles 
SET role = 'super_admin' 
WHERE email = 'user@example.com';
```

### View All Users and Roles:
```sql
SELECT 
  ur.email, 
  ur.role, 
  ur.is_active, 
  ur.created_at,
  au.email_confirmed_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;
```

### Deactivate User:
```sql
UPDATE user_roles 
SET is_active = false 
WHERE email = 'user@example.com';
```

## 🚪 User Flow

### New User Registration:
1. User discovers hidden signup (5 clicks on logo)
2. Creates account → automatically gets 'user' role
3. Sees "Access denied" message with role information
4. Contacts admin to request role upgrade
5. Admin promotes user via SQL
6. User can now access admin panel

### Admin Login:
1. Goes to `/login`
2. Signs in with credentials
3. System checks role in `user_roles` table
4. If admin/super_admin → redirects to `/properties`
5. If not admin → shows "Access denied" page

## 🛡️ Security Features

### Row Level Security (RLS):
- All tables now use role-based RLS policies
- Only authenticated admins can modify data
- Public users can still read published content

### Role Hierarchy:
- **user**: No admin access
- **admin**: Full admin panel access
- **super_admin**: Can manage user roles + full access

### Authentication State:
- Managed by `AuthContext` throughout the app
- `ProtectedRoute` component guards admin pages  
- `useAuth` hook provides user state anywhere

## 📱 Admin Panel Features

### Header Information:
- Shows logged-in user email and role
- Proper logout functionality
- Mobile-responsive navigation

### Protected Routes:
- `/properties` - Requires admin role
- Future admin pages automatically protected
- Unauthorized users redirected to `/unauthorized`

## 🐛 Troubleshooting

### "Error creating category" Issue:
- **Cause**: Old RLS policies blocked non-authenticated users
- **Fix**: New auth system with role-based policies resolves this
- **Verify**: Make sure `01-auth.sql` is deployed

### User Can't Access Admin Panel:
1. Check if user exists in `user_roles` table
2. Verify `role` is 'admin' or 'super_admin'  
3. Ensure `is_active = true`
4. Check browser console for auth errors

### Hidden Signup Not Showing:
- Click the "IR" logo exactly **5 times** on login page
- Counter resets after 5 clicks, try again if needed

## 🔄 Next Steps

1. **Deploy the SQL schema** - This is critical!
2. **Create your first admin account**
3. **Test login/logout functionality**
4. **Promote test account to admin role**
5. **Verify category creation works**

## 📞 Support

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify SQL schema was deployed successfully
3. Check browser console for authentication errors
4. Ensure RLS policies are working correctly

---

**Remember:** The authentication system will not work until you deploy `database/01-auth.sql` to your Supabase project!
