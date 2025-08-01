import { supabase } from "./supabase"

export const signUp = async (email: string, password: string, fullName: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    // Create profile after successful signup
    if (data.user && !data.user.email_confirmed_at) {
      // For development, we'll create the profile immediately
      // In production, this should be done after email confirmation
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        },
      ])

      // Don't throw error if profile already exists
      if (profileError && !profileError.message.includes("duplicate key")) {
        console.error("Profile creation error:", profileError)
      }
    }

    return data
  } catch (error) {
    console.error("SignUp error:", error)
    throw error
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Ensure profile exists
    if (data.user) {
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

      if (!existingProfile) {
        // Create profile if it doesn't exist
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || "",
          },
        ])
      }
    }

    return data
  } catch (error) {
    console.error("SignIn error:", error)
    throw error
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}
