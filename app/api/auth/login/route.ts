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
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          errors: [{ message: "Email and password are required" }],
        },
        { status: 400 }
      );
    }

    // Sign in user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

    if (authError) {
      return NextResponse.json(
        { success: false, errors: [{ message: authError.message }] },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          errors: [{ message: "No account found with this email address" }],
        },
        { status: 400 }
      );
    }

    // Get user data from custom users table
    let { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    // If user doesn't exist in custom table, create it
    if (userError || !userData) {
      console.log("User not found in custom table, creating...");
      const { data: newUserData, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: authData.user.id,
          name: authData.user.user_metadata?.name || "User",
          email: authData.user.email,
          phone: authData.user.user_metadata?.phone || null,
          address: authData.user.user_metadata?.address || null,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user record:", createError);
        return NextResponse.json(
          { success: false, errors: [{ message: "User profile not found" }] },
          { status: 400 }
        );
      }

      userData = newUserData;
    }

    // Return success with user data
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
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, errors: [{ message: "An unexpected error occurred" }] },
      { status: 500 }
    );
  }
}
