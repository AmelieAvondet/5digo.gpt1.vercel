// Archivo: app/action.ts

"use server";

import { supabaseAdmin, createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getCurrentUser, clearAuthSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = ((formData.get("role") as string) || 'alumno') as 'profesor' | 'alumno';

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    console.log(`[AUTH] Registrando nuevo usuario: ${email}, role: ${role}`);

    const supabase = await createServerClient();

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error(`[AUTH] Error en signup:`, authError.message);
      if (authError.message.includes('already registered')) {
        return { error: "El email ya está registrado." };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Error al crear el usuario." };
    }

    // 2. Guardar información adicional del usuario en tabla users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        role,
        password_hash: 'managed_by_supabase_auth' // Dummy value para cumplir constraint NOT NULL de la BD actual
      }])
      .select()
      .single();

    if (dbError) {
      console.error(`[AUTH] Error al guardar usuario en DB:`, dbError.message);
      // Limpiar el usuario de auth si falla la DB
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { error: "Error al registrar usuario." };
    }

    console.log(`[AUTH] Usuario registrado exitosamente: ${email}`);

    // Guardar sesión en cookies
    if (authData.session) {
      const cookieStore = await cookies();
      cookieStore.set('sb-access-token', authData.session.access_token, {
        path: '/',
        httpOnly: true,
        // IMPORTANTE: secure false para localhost para evitar problemas con http
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        sameSite: 'lax',
      });
    }

    return {
      success: true,
      userId: authData.user.id,
      role,
      message: "Registro exitoso."
    };

  } catch (e: any) {
    console.error(`[AUTH] Error en registro:`, e.message);
    return { error: e.message || "Error al registrar usuario." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Faltan email o contraseña." };
  }

  try {
    console.log(`[AUTH] Intento de login para: ${email}`);

    const supabase = await createServerClient();

    // 1. Realizar login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log(`[AUTH] Error en login:`, authError.message);
      return { error: "Credenciales inválidas." };
    }

    if (!authData.user) {
      return { error: "Error al iniciar sesión." };
    }

    // 2. Obtener información del usuario desde la tabla users
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .single();

    if (dbError || !userData) {
      console.log(`[AUTH] Usuario no encontrado en DB:`, dbError?.message);
      return { error: "Credenciales inválidas." };
    }

    console.log(`[AUTH] Login exitoso para: ${email}`);

    // Guardar sesión en cookies
    if (authData.session) {
      const cookieStore = await cookies();
      cookieStore.set('sb-access-token', authData.session.access_token, {
        path: '/',
        httpOnly: true,
        // IMPORTANTE: secure false para localhost
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
        sameSite: 'lax',
      });
    }

    return {
      success: true,
      userId: userData.id,
      role: userData.role
    };

  } catch (e: any) {
    console.error(`[AUTH] Error en login:`, e.message);
    return { error: e.message || "Error al iniciar sesión." };
  }
}

export async function logoutUser() {
  try {
    console.log(`[AUTH] Logout solicitado`);
    const cookieStore = await cookies();
    cookieStore.delete('sb-access-token');

    const supabase = await createServerClient();
    await supabase.auth.signOut();
    await clearAuthSession();
    return { success: true };
  } catch (e: any) {
    console.error(`[AUTH] Error en logout:`, e.message);
    return { error: e.message || "Error al cerrar sesión." };
  }
}