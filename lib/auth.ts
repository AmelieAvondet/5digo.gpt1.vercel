// Archivo: lib/auth.ts
// Utilidades de autenticación con Supabase Auth

import { cookies } from 'next/headers';
import { createServerClient } from './supabase';

/**
 * Interfaz del usuario autenticado
 */
export interface AuthUser {
  id: string;
  email: string;
  role: 'profesor' | 'alumno';
}

/**
 * Obtiene el usuario actual desde la sesión de Supabase
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('[AUTH] No user session found');
      return null;
    }

    // Obtener rol adicional desde tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.log('[AUTH] User data not found in database');
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    };
  } catch (error) {
    console.error('[AUTH] Error getting current user:', error);
    return null;
  }
}

/**
 * Obtiene el ID del usuario actual
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * Clearea la sesión de autenticación
 */
export async function clearAuthSession(): Promise<void> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[AUTH] Error clearing session:', error);
  }
}
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
}

/**
 * Elimina el token de autenticación de las cookies
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}
