// Archivo: lib/auth.ts
// Utilidades de autenticación con Supabase Auth

import { createServerClient } from './supabase';
import { cookies } from 'next/headers';

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
    const cookieStore = await cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return null;
    }

    const supabase = await createServerClient();

    // Validar token con Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      // console.log('[AUTH] No user session found');
      return null;
    }

    // Obtener rol adicional desde tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      // console.log('[AUTH] User data not found in database');
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    };
  } catch (error) {
    // console.error('[AUTH] Error getting current user:', error);
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
