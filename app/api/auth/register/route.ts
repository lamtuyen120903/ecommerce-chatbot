import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          errors: [{ message: "Name, email, and password are required" }],
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          errors: [
            {
              field: "email",
              message: "An account with this email already exists",
            },
          ],
        },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password,
        email_confirm: true, // Auto-confirm email for demo
        user_metadata: {
          name: name.trim(),
          phone: phone?.trim(),
          address: address?.trim(),
        },
      });

    if (authError) {
      console.error("Auth creation error:", authError);
      return NextResponse.json(
        { success: false, errors: [{ message: authError.message }] },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, errors: [{ message: "Failed to create account" }] },
        { status: 500 }
      );
    }

    // Insert user data into custom users table
    const { data: userData, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      // Clean up the auth user if insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        {
          success: false,
          errors: [{ message: "Failed to create user profile" }],
        },
        { status: 500 }
      );
    }

    // Return success with user data (without sensitive info)
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    };

    return NextResponse.json({
      success: true,
      user,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "An unexpected error occurred" }] },
      { status: 500 }
    );
  }
}
