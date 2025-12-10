# 🎓 Tutor IA - Plataforma Educativa

Plataforma educativa inteligente con tutor personalizado basado en Google Gemini AI.

## 🚀 Tecnologías

- **Next.js 16** (React 19) + TypeScript
- **Tailwind CSS 4** - Estilos
- **Supabase** - Base de datos PostgreSQL
- **Google Gemini 2.0 Flash** - Inteligencia Artificial
- **Vercel** - Hosting y CI/CD

## 📋 Características

- 🤖 Tutor AI que evalúa progreso y se adapta al estudiante
- 📚 Gestión completa de cursos y temas
- 🎓 Sistema de seguimiento automático de progreso
- 💬 Chat conversacional con formato Markdown
- 🔐 Autenticación segura con JWT

## 🛠️ Instalación

```bash
# Clonar repositorio
git clone <tu-repo>
cd 5digo.gpt.vercel

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

## 📁 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
JWT_SECRET=tu-secret-de-32-caracteres
GEMINI_API_KEY=tu-gemini-api-key
```

## 📖 Documentación

Ver [ARQUITECTURA_Y_TECNOLOGIAS.md](./ARQUITECTURA_Y_TECNOLOGIAS.md) para documentación completa del proyecto.

## 🗄️ Base de Datos

La estructura de la base de datos está documentada en [ARQUITECTURA_Y_TECNOLOGIAS.md](./ARQUITECTURA_Y_TECNOLOGIAS.md#base-de-datos).

## 🎯 Uso

### Como Profesor:
1. Registrarse como profesor
2. Crear un curso con código único
3. Agregar temas al curso
4. Compartir código con estudiantes

### Como Estudiante:
1. Registrarse como alumno
2. Inscribirse con código del curso
3. Chatear con el tutor IA
4. Completar temas y avanzar automáticamente

## 🚀 Deploy

El proyecto está configurado para deploy automático en Vercel:

```bash
git push origin main
```

Vercel detectará el push y desplegará automáticamente.

## 📄 Licencia

MIT
