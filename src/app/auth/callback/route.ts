// Archivo: app/auth/callback/route.ts

import { createServerSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();

    // Intercambiar el código por una sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AUTH] Error al confirmar email:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=Email de verificación inválido o expirado`, requestUrl.origin)
      );
    }

    if (data.user) {
      console.log(`[AUTH] Email confirmado exitosamente para: ${data.user.email}`);

      // Obtener el rol del usuario para redirigir apropiadamente
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Redirigir según el rol
      if (profile?.role === 'profesor') {
        return NextResponse.redirect(new URL('/admin/courses', requestUrl.origin));
      } else {
        return NextResponse.redirect(new URL('/courses', requestUrl.origin));
      }
    }
  }

  // Si no hay código, redirigir al login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
