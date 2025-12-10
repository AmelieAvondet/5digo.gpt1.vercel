# 🔒 Guía de Seguridad - API Keys y Variables de Entorno

## ⚠️ PROBLEMA RESUELTO

El proyecto tenía **API keys sensibles expuestas en el cliente**, lo que permitía que cualquiera viese:
- `GEMINI_API_KEY` (Acceso a Google Gemini)
- `SUPABASE_SERVICE_ROLE_KEY` (Acceso total a la base de datos)

### ❌ Antes (INSEGURO)
```javascript
// ❌ NUNCA hacer esto
const GEMINI_API_KEY = "AIzaSy..."; // Visible en DevTools
const API_KEY = process.env.GEMINI_API_KEY; // Expuesto en bundle
```

### ✅ Después (SEGURO)
```javascript
// ✅ Ahora las claves solo están en el servidor
'use server';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Solo se ejecuta en Node.js, NUNCA en el cliente
```

## 📋 Estructura de Variables de Entorno

### Variables PRIVADAS (Solo servidor)
```env
# ⚠️ NUNCA compartas estas claves
GEMINI_API_KEY=AIzaSy...        # Google Gemini API
SUPABASE_SERVICE_ROLE_KEY=ey... # Acceso total a Supabase
JWT_SECRET=31d7e...             # Secreto de autenticación
```

### Variables PÚBLICAS (Seguro enviar al cliente)
```env
# ✅ Seguro para el cliente (prefijo NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
```

## 🔐 Dónde se Usan las Keys

### ✅ SEGURO - Server Actions (`'use server'`)
```typescript
'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// ✅ Ejecuta SOLO en servidor, nunca se envía al cliente
```

### ✅ SEGURO - API Routes (`/api/...`)
```typescript
// /api/chat/route.ts
export async function POST(request: NextRequest) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // ✅ Ejecuta SOLO en servidor
}
```

### ❌ INSEGURO - Componentes del Cliente
```typescript
'use client';
// ❌ NUNCA importar @/lib/gemini aquí
// ❌ NUNCA acceder a process.env.GEMINI_API_KEY
```

## 🔄 Flujo Seguro de Llamadas a IA

```
┌─────────────────┐
│  Cliente        │  (Navegador)
│  (Next.js App)  │
└────────┬────────┘
         │ fetch('/api/chat', { body: { userMessage } })
         │ ✅ SIN API keys
         │
         ▼
┌─────────────────┐
│  Servidor       │  (Node.js)
│  (/api/chat)    │
│                 │
│  const genAI =  │
│    new GoogleGen(
│      process.env.GEMINI_API_KEY ← ✅ Seguro aquí
│    )
│                 │
│  response = IA  │
└────────┬────────┘
         │ return { response }
         │ ✅ SIN API keys
         │
         ▼
┌─────────────────┐
│  Cliente        │  (Navegador)
│  Recibe respuesta│  ✅ Seguro
└─────────────────┘
```

## 🛡️ Checklist de Seguridad

- ✅ GEMINI_API_KEY solo en `.env.local` (servidor)
- ✅ SUPABASE_SERVICE_ROLE_KEY solo en `.env.local` (servidor)
- ✅ JWT_SECRET solo en `.env.local` (servidor)
- ✅ Archivos con `'use server'` pueden acceder a las keys
- ✅ Archivos con `'use client'` NO pueden acceder a las keys
- ✅ API routes pueden acceder a las keys
- ✅ NEXT_PUBLIC_* variables están seguras en el cliente
- ✅ `.env.local` está en `.gitignore`

## 🚨 Si Accidentalmente Expusiste una Key

1. **INMEDIATAMENTE** regenera la key en el servicio (Gemini, Supabase)
2. Elimina la key del repositorio
3. Busca en git: `git log --all --full-history -- .env.local`
4. Si fue pushed, considera la key comprometida
5. Actualiza en todos los servicios (Vercel, etc.)

## 📚 Referencias

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Google AI API Key Security](https://ai.google.dev/gemini-api/docs/api-key-management)
- [Supabase API Keys](https://supabase.com/docs/guides/api#api-keys)

## ✅ Cambios Realizados

1. ✅ Agregado `'use server'` a `lib/gemini.ts`
2. ✅ Actualizado `chat/action.ts` para usar GoogleGenerativeAI seguramente
3. ✅ Creado `.env.example` con instrucciones
4. ✅ Verificado que no hay keys en el código
5. ✅ Proyecto compila sin errores
