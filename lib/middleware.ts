// Archivo: lib/middleware.ts
// Middleware para proteger rutas y refrescar sesiones

import { createServerClient } from './supabase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = await createServerClient();

    // Refrescar la sesión
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Definir rutas protegidas
    const protectedRoutes = ['/admin', '/student', '/courses', '/chat'];
    const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

    // Si no hay usuario y se accede a ruta protegida, redirigir a login
    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Si hay usuario y se accede a ruta de auth, redirigir a dashboard
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL('/courses', request.url));
    }
  } catch (error) {
    console.error('[MIDDLEWARE] Error updating session:', error);
  }

  return response;
}
