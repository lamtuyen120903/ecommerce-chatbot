# Supabase Authentication Setup

## Prerequisites

1. A Supabase project with PostgreSQL database
2. The `users` table already created in your Supabase database

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is used only in server-side API routes and is never exposed to the client.

## Database Schema

Your `users` table should have the following structure:

```sql
CREATE TABLE public.users (
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  address text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
```

## Supabase Configuration

### 1. Enable Email Authentication

1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings
3. Enable "Enable email confirmations" if you want email verification
4. Configure your email templates

### 2. Set up Row Level Security (RLS)

Enable RLS on your `users` table and create policies:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

**Note**: User registration and login are handled server-side via API routes, so no client-side insert policies are needed.

### 3. Create a Database Function for Auto-updating timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Security Features

### Server-Side Authentication

- ✅ Registration and login handled via secure API routes
- ✅ Service role key only used server-side
- ✅ No sensitive keys exposed to client
- ✅ Proper input validation and sanitization

### Client-Side Security

- ✅ Only anon key used in client-side code
- ✅ RLS policies protect user data
- ✅ Session management via localStorage
- ✅ Secure logout functionality

## API Routes

### `/api/auth/register`

- Creates user in Supabase Auth
- Inserts user data into custom `users` table
- Returns user data without sensitive information

### `/api/auth/login`

- Authenticates user with Supabase Auth
- Retrieves user data from custom `users` table
- Returns user data for client-side storage

## Features Implemented

### Registration

- Secure server-side user creation
- Automatic user ID synchronization
- Input validation and error handling
- No client-side service role exposure

### Login

- Secure server-side authentication
- User data retrieval from custom table
- Session management with localStorage

### Profile Management

- Update user profile information
- Real-time database updates
- Client-side state synchronization

### Logout

- Supabase Auth sign out
- Local storage cleanup
- Session termination

## Error Handling

- Comprehensive error messages in Vietnamese
- Field-specific error display
- Network error handling
- Database constraint violation handling
