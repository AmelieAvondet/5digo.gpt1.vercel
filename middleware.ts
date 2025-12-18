// Archivo: middleware.ts
// Middleware para proteger rutas con Supabase Auth

import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = ['/chat', '/admin', '/student', '/courses'];
const publicRoutes = ['/login', '/register', '/'];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rutas públicas
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));
  
  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Si es ruta pública, dejar pasar
  if (isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  // Obtener la cookie de sesión de Supabase
  const authToken = request.cookies.get('sb-access-token')?.value;

  if (!authToken && isProtectedRoute) {
    console.log(`[MIDDLEWARE] Acceso denegado a ${pathname}: sin sesión`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay usuario en ruta auth, redirigir
  if (authToken && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/courses', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincidir todas las rutas de solicitud excepto las siguientes:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (archivo de favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
