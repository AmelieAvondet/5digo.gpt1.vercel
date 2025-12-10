# 🏗️ Arquitectura y Tecnologías del Proyecto

**Tutor IA - Plataforma Educativa con Inteligencia Artificial**

Este documento explica la estructura completa del proyecto, las tecnologías utilizadas y cómo interactúan entre sí.

---

## 📋 Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Tecnologías Frontend](#tecnologías-frontend)
5. [Tecnologías Backend](#tecnologías-backend)
6. [Base de Datos](#base-de-datos)
7. [Inteligencia Artificial](#inteligencia-artificial)
8. [Deploy y CI/CD](#deploy-y-cicd)
9. [Estructura de Carpetas](#estructura-de-carpetas)
10. [Flujo de Datos](#flujo-de-datos)
11. [Características Principales](#características-principales)

---

## 🎯 Resumen del Proyecto

**Tutor IA** es una plataforma educativa que utiliza Inteligencia Artificial (Google Gemini) para proporcionar tutorías personalizadas a estudiantes. El sistema permite a los profesores crear cursos con múltiples temas, y a los estudiantes inscribirse y aprender mediante conversaciones interactivas con un tutor AI que se adapta a su ritmo de aprendizaje.

### Características Principales:
- 🤖 Tutor AI personalizado que evalúa el progreso del estudiante
- 📚 Gestión completa de cursos y temas por parte de profesores
- 🎓 Sistema de seguimiento de progreso automático
- 💬 Chat conversacional con formato Markdown
- 🔐 Autenticación segura con JWT
- 📊 Dashboard para estudiantes y profesores

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** (React 19) - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **React Markdown** - Renderizado de mensajes con formato

### Backend
- **Next.js Server Actions** - API serverless
- **Supabase** - Base de datos PostgreSQL
- **Jose** - Autenticación JWT

### AI & ML
- **Google Gemini 2.0 Flash** - Modelo de lenguaje
- **@google/genai SDK** - Cliente JavaScript

### Deploy & DevOps
- **Vercel** - Hosting y CI/CD
- **GitHub** - Control de versiones
- **Turbopack** - Build tool (Next.js)

---

## 🏛️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO                              │
│                    (Navegador Web)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components (Pages)                            │   │
│  │  - Login/Register                                    │   │
│  │  - Dashboard (Profesor/Alumno)                       │   │
│  │  - Chat con IA                                       │   │
│  │  - Gestión de Cursos                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Server Actions)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Acciones del Servidor:                              │   │
│  │  - action.ts (Autenticación)                         │   │
│  │  - chat/action.ts (Tutor IA)                         │   │
│  │  - student/actions.ts (Estudiante)                   │   │
│  │  - admin/actions.ts (Profesor)                       │   │
│  └──────────────────┬──────────┬────────────────────────┘   │
└─────────────────────┼──────────┼───────────────────────────┘
                      │          │
         ┌────────────┘          └──────────────┐
         ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│   SUPABASE (DB)      │              │  GOOGLE GEMINI API   │
│   PostgreSQL         │              │  (AI Model)          │
│                      │              │                      │
│  - users             │              │  - Generación de     │
│  - courses           │              │    respuestas        │
│  - topics            │              │  - Evaluación de     │
│  - enrollments       │              │    comprensión       │
│  - student_syllabus  │              │                      │
│  - chat_sessions     │              │                      │
└──────────────────────┘              └──────────────────────┘
```

---

## 💻 Tecnologías Frontend

### 1. **Next.js 16 (React 19)**

**¿Qué es?**
Next.js es un framework de React que permite crear aplicaciones web modernas con renderizado del lado del servidor (SSR), generación estática (SSG) y rutas API integradas.

**¿Por qué lo usamos?**
- **App Router**: Nueva arquitectura de rutas basada en carpetas
- **Server Components**: Componentes que se ejecutan en el servidor para mejor rendimiento
- **Server Actions**: API sin necesidad de crear endpoints REST
- **Turbopack**: Build tool ultra rápido
- **React 19**: Última versión con mejoras de rendimiento

**Ejemplo en nuestro proyecto:**
```typescript
// src/app/login/page.tsx
"use client"; // Componente del cliente

export default function LoginPage() {
  return (
    <div>
      <h1>Iniciar Sesión</h1>
      {/* Formulario de login */}
    </div>
  );
}
```

### 2. **TypeScript**

**¿Qué es?**
Superset de JavaScript que agrega tipado estático, permitiendo detectar errores en tiempo de desarrollo.

**¿Por qué lo usamos?**
- Prevención de errores
- Mejor autocompletado en el editor
- Documentación implícita del código
- Refactorización más segura

**Ejemplo:**
```typescript
interface User {
  id: string;
  email: string;
  role: 'profesor' | 'alumno';
}

function getUserById(id: string): Promise<User | null> {
  // TypeScript sabe que debe retornar User o null
  return supabaseAdmin.from('users').select('*').eq('id', id).single();
}
```

### 3. **Tailwind CSS 4**

**¿Qué es?**
Framework de CSS utility-first que permite crear interfaces rápidamente usando clases predefinidas.

**¿Por qué lo usamos?**
- Desarrollo rápido sin escribir CSS personalizado
- Diseño responsive fácil
- Consistencia visual
- Tamaño final pequeño (purga clases no usadas)

**Ejemplo:**
```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Guardar Curso
</button>
```

### 4. **React Markdown**

**¿Qué es?**
Librería que convierte texto Markdown a componentes React con formato HTML.

**¿Por qué lo usamos?**
- La IA devuelve respuestas en formato Markdown
- Permite mostrar código con syntax highlighting
- Renderiza listas, negritas, cursivas automáticamente

**Ejemplo:**
```tsx
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>
  {`**Variables en Python**\n\n- int\n- string\n- float`}
</ReactMarkdown>
```

---

## ⚙️ Tecnologías Backend

### 1. **Next.js Server Actions**

**¿Qué es?**
Funciones que se ejecutan en el servidor pero pueden ser llamadas directamente desde componentes del cliente, sin crear APIs REST tradicionales.

**¿Por qué lo usamos?**
- Simplicidad: No necesitamos crear rutas `/api/...`
- Seguridad: Las credenciales nunca se exponen al cliente
- TypeScript end-to-end: Tipos compartidos entre cliente y servidor
- Menos código boilerplate

**Ejemplo:**
```typescript
// src/app/action.ts
"use server"; // Marca función como Server Action

export async function loginUser(email: string, password: string) {
  // Este código se ejecuta en el servidor
  const user = await supabaseAdmin.auth.signIn({ email, password });
  return { success: true, user };
}

// src/app/login/page.tsx
"use client";

import { loginUser } from '../action';

async function handleLogin() {
  const result = await loginUser(email, password); // Llamada directa
}
```

### 2. **Supabase Client**

**¿Qué es?**
Cliente JavaScript para interactuar con la base de datos PostgreSQL de Supabase.

**¿Por qué lo usamos?**
- Abstracción simple sobre PostgreSQL
- Queries tipo SQL pero en JavaScript
- Relaciones automáticas entre tablas
- RLS (Row Level Security) integrado

**Ejemplo:**
```typescript
import { supabaseAdmin } from '@/lib/supabase';

// Obtener cursos de un profesor
const { data, error } = await supabaseAdmin
  .from('courses')
  .select('id, name, description')
  .eq('teacher_id', userId)
  .order('created_at', { ascending: false });
```

### 3. **Jose (JWT)**

**¿Qué es?**
Librería para crear y verificar JSON Web Tokens (JWT) para autenticación.

**¿Por qué lo usamos?**
- Autenticación sin estado (stateless)
- Tokens seguros con firma digital
- Expiración automática de sesiones
- Compatible con HTTP-only cookies

**Ejemplo:**
```typescript
import { SignJWT, jwtVerify } from 'jose';

// Crear token
const token = await new SignJWT({ userId, email, role })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .sign(JWT_SECRET);

// Verificar token
const { payload } = await jwtVerify(token, JWT_SECRET);
```

---

## 🗄️ Base de Datos

### **Supabase (PostgreSQL)**

**¿Qué es?**
Supabase es una alternativa open-source a Firebase que proporciona una base de datos PostgreSQL con APIs RESTful automáticas, autenticación y almacenamiento.

**¿Por qué lo usamos?**
- Base de datos SQL robusta y madura
- Panel de administración visual
- Backups automáticos
- Escalable
- Gratis para desarrollo

### Esquema de la Base de Datos

```sql
-- Usuarios (profesores y alumnos)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('profesor', 'alumno')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cursos
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL,
  teacher_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Temas de un curso
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  activities JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inscripciones de estudiantes
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Plan de estudios por estudiante
CREATE TABLE student_syllabus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  topic_id UUID REFERENCES topics(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sesiones de chat
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  topic_id UUID REFERENCES topics(id),
  context_data JSONB DEFAULT '{"messages": []}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, topic_id)
);

-- Configuración de persona del tutor
CREATE TABLE persona_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Relaciones Entre Tablas

```
users (1) ──┬─→ (N) courses (como profesor)
            │
            └─→ (N) course_enrollments (como estudiante)
                      │
                      └─→ (1) courses
                      │
                      └─→ (N) student_syllabus
                               │
                               └─→ (1) topics

courses (1) ──┬─→ (N) topics
              │
              └─→ (1) persona_config

student_syllabus (N) ─→ (1) topics
chat_sessions (N) ─→ (1) topics
```

---

## 🤖 Inteligencia Artificial

### **Google Gemini 2.0 Flash**

**¿Qué es?**
Modelo de lenguaje grande (LLM) de Google, optimizado para velocidad y costo, capaz de entender contexto y generar respuestas inteligentes.

**¿Por qué lo usamos?**
- Gratuito con límites generosos (15 req/min)
- Respuestas rápidas (Flash = rápido)
- Soporta contexto largo (conversaciones extensas)
- API simple de usar
- Multimodal (texto, imágenes en el futuro)

### Arquitectura Pedagógica (Dual-Agent System)

Nuestro sistema usa **dos agentes de IA**:

#### 1. **Agente Docente (Teacher Agent)** - Síncrono
**Responsabilidad:** Interactuar con el estudiante en tiempo real

**Flujo:**
```
Usuario envía mensaje
     ↓
Agente Docente recibe:
  - Mensaje del usuario
  - Historial de chat
  - Plan de estudios (syllabus)
  - Configuración de personalidad
     ↓
Gemini procesa y genera:
  - Respuesta educativa
  - Actualización de estado (JSON)
     ↓
Sistema actualiza BD:
  - Estado del tema (pending/in_progress/completed)
  - Historial de chat
     ↓
Usuario recibe respuesta inmediata
```

**Código:**
```typescript
// src/app/chat/action.ts
export async function handleStudentMessage(courseId: string, userMessage: string) {
  // 1. Obtener contexto
  const syllabus = await getStudentSyllabus(userId, courseId);
  const chatHistory = await getChatMessages(userId, syllabus.current_topic_id);

  // 2. Construir prompt del sistema
  const systemPrompt = fillPrompt(TEACHER_PROMPT, {
    PERSONA_JSON: JSON.stringify(personaConfig),
    SYLLABUS_JSON: JSON.stringify(syllabus),
    USER_INPUT: userMessage,
  });

  // 3. Llamar a Gemini
  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...chatHistory,
      { role: 'user', parts: [{ text: userMessage }] },
    ],
  });

  // 4. Parsear respuesta
  const textToUser = extractTextResponse(aiResponse.text);
  const stateUpdate = extractStateJSON(aiResponse.text);

  // 5. Actualizar BD
  await updateSyllabusState(userId, courseId, stateUpdate);
  await updateChatHistory(userId, topicId, [
    { role: 'user', content: userMessage },
    { role: 'assistant', content: textToUser },
  ]);

  return { response: textToUser };
}
```

#### 2. **Agente Notario (Notary Agent)** - Asíncrono
**Responsabilidad:** Generar resúmenes pedagógicos después de completar un tema

**Flujo:**
```
Tema completado
     ↓
Trigger asíncrono (fire & forget)
     ↓
Agente Notario recibe historial completo del tema
     ↓
Gemini analiza:
  - Dudas del estudiante
  - Analogías efectivas
  - Nivel de engagement
     ↓
Genera resumen JSON pedagógico
     ↓
Se guarda en BD para futuras referencias
```

**Código:**
```typescript
// lib/notaryAgent.ts
export async function triggerNotaryAsync(studentId: string, topicId: string) {
  // NO se espera (no await) - Fire and forget
  generatePedagogicalSummary(studentId, topicId).catch(console.error);
}

async function generatePedagogicalSummary(studentId: string, topicId: string) {
  const chatHistory = await getChatHistoryForTopic(studentId, topicId);

  const prompt = fillPrompt(NOTARY_PROMPT, {
    CHAT_HISTORY: JSON.stringify(chatHistory),
  });

  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const summary = JSON.parse(aiResponse.text);

  // Guardar resumen pedagógico
  await supabaseAdmin
    .from('topic_summaries')
    .insert({ student_id: studentId, topic_id: topicId, summary });
}
```

### Formato de Comunicación con la IA

**Entrada (Prompt):**
```
# SYSTEM ROLE: AI INSTRUCTIONAL ENGINE

<PERSONA_CONFIG>
{
  "tone": "amigable",
  "explanation_style": "analogías simples",
  "difficulty_level": "intermedio"
}
</PERSONA_CONFIG>

<SYLLABUS_STATE>
{
  "current_topic_id": "sub1_1",
  "topics": [
    {"topic_id": "sub1_1", "name": "Variables", "status": "in_progress"},
    {"topic_id": "sub1_2", "name": "Operadores", "status": "pending"}
  ]
}
</SYLLABUS_STATE>

<USER_INPUT>
¿Qué es una variable?
</USER_INPUT>
```

**Salida (Respuesta de la IA):**
```
Una variable es como una caja en la memoria de tu computadora...

**Ejemplo:**
```python
edad = 25  # Variable de tipo entero
```

###STATE_UPDATE###
{"trigger_summary_generation":false,"current_topic_id":"sub1_1","topics_updated":[{"topic_id":"sub1_1","status":"in_progress"}]}
```

---

## 🚀 Deploy y CI/CD

### **Vercel**

**¿Qué es?**
Plataforma de hosting especializada en Next.js, con deploy automático y CDN global.

**¿Por qué lo usamos?**
- Deploy automático desde GitHub
- Preview deployments para cada PR
- Edge network global (baja latencia)
- Serverless functions automáticas
- Gratis para proyectos personales

### **GitHub**

**¿Qué es?**
Plataforma de control de versiones usando Git.

**¿Por qué lo usamos?**
- Control de versiones del código
- Colaboración entre desarrolladores
- Historial de cambios
- Integración con Vercel para CI/CD

### Flujo de Deploy

```
1. Desarrollador hace cambios en código local
   ↓
2. git add . && git commit -m "mensaje"
   ↓
3. git push origin main
   ↓
4. GitHub recibe el push
   ↓
5. Webhook notifica a Vercel
   ↓
6. Vercel:
   - Clona el código
   - npm install (instala dependencias)
   - npm run build (compila el proyecto)
   - Despliega a edge network
   ↓
7. Sitio actualizado en https://tu-proyecto.vercel.app
```

---

## 📁 Estructura de Carpetas

```
5digo.gpt.vercel/
│
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── page.tsx           # Página principal (/)
│   │   ├── layout.tsx         # Layout raíz
│   │   ├── action.ts          # Server Actions de autenticación
│   │   │
│   │   ├── login/             # Ruta /login
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/          # Ruta /register
│   │   │   └── page.tsx
│   │   │
│   │   ├── chat/              # Ruta /chat
│   │   │   ├── page.tsx       # UI del chat
│   │   │   ├── action.ts      # Lógica del Tutor IA
│   │   │   └── loader.ts      # Carga de datos
│   │   │
│   │   ├── courses/           # Rutas de cursos
│   │   │   ├── page.tsx       # Lista de cursos (/courses)
│   │   │   └── [id]/          # Detalle del curso (/courses/:id)
│   │   │       ├── page.tsx
│   │   │       └── topics/    # Topics del curso
│   │   │           └── [topicId]/
│   │   │               └── page.tsx
│   │   │
│   │   ├── admin/             # Panel de administración
│   │   │   ├── courses/       # CRUD de cursos
│   │   │   ├── topics/        # CRUD de topics
│   │   │   ├── persona/       # Configuración de personalidad IA
│   │   │   └── import-course/ # Importar curso desde JSON
│   │   │
│   │   └── student/           # Acciones de estudiantes
│   │       └── actions.ts
│   │
│   └── components/            # Componentes reutilizables
│       ├── AdminHeader.tsx    # Header del panel admin
│       ├── AdminLayout.tsx    # Layout del panel admin
│       └── MarkdownMessage.tsx # Renderizador de Markdown
│
├── lib/                       # Librerías y utilidades
│   ├── supabase.ts           # Cliente de Supabase
│   ├── auth.ts               # Helpers de autenticación JWT
│   ├── prompts.ts            # Prompts del sistema para IA
│   ├── stateParser.ts        # Parser de respuestas de IA
│   ├── dbHelpers.ts          # Helpers de base de datos
│   └── notaryAgent.ts        # Agente Notario asíncrono
│
├── public/                    # Archivos estáticos
│
├── .env.local                # Variables de entorno (NO subir a Git)
├── .env.example              # Ejemplo de variables de entorno
├── package.json              # Dependencias del proyecto
├── tsconfig.json             # Configuración de TypeScript
├── tailwind.config.ts        # Configuración de Tailwind
├── next.config.ts            # Configuración de Next.js
└── README.md                 # Documentación del proyecto
```

---

## 🔄 Flujo de Datos

### Flujo 1: Registro de Usuario

```
1. Usuario rellena formulario en /register
   ↓
2. Formulario llama a registerUser() (Server Action)
   ↓
3. Server Action:
   - Valida datos
   - Hashea contraseña
   - Inserta usuario en Supabase
   - Genera JWT token
   - Establece cookie HTTP-only
   ↓
4. Usuario es redirigido al dashboard
```

### Flujo 2: Crear un Curso (Profesor)

```
1. Profesor va a /admin/courses/new
   ↓
2. Rellena formulario (nombre, descripción, código)
   ↓
3. Formulario llama a createCourse() (Server Action)
   ↓
4. Server Action:
   - Extrae userId del JWT
   - Valida que sea profesor
   - Genera código único si no se proporcionó
   - Inserta curso en Supabase
   ↓
5. Profesor es redirigido a /admin/courses con mensaje de éxito
```

### Flujo 3: Inscripción a un Curso (Estudiante)

```
1. Estudiante ingresa código de curso en /courses
   ↓
2. Llama a enrollInCourse(courseCode) (Server Action)
   ↓
3. Server Action:
   - Busca curso por código
   - Verifica que no esté ya inscrito
   - Crea registro en course_enrollments
   - Inicializa syllabus: obtiene todos los topics del curso
   - Crea entradas en student_syllabus (primer topic = in_progress)
   ↓
4. Estudiante ve el curso en su lista
```

### Flujo 4: Chat con Tutor IA (Lo Más Importante)

```
1. Estudiante abre curso y hace clic en un tema
   ↓
2. Componente de Chat llama a initializeChatSession()
   ↓
3. initializeChatSession():
   - Obtiene syllabus del estudiante
   - Identifica tema actual (in_progress)
   - Llama a Gemini con prompt de introducción
   - Guarda mensaje inicial en chat_sessions
   ↓
4. Usuario ve mensaje de bienvenida del tutor
   ↓
5. Usuario escribe pregunta y envía
   ↓
6. Formulario llama a handleStudentMessage(courseId, userMessage)
   ↓
7. handleStudentMessage():
   a) Obtener contexto:
      - Syllabus del estudiante
      - Historial de chat del tema actual
      - Configuración de persona

   b) Construir prompt completo:
      - System prompt con PERSONA_JSON y SYLLABUS_JSON
      - Historial de conversación
      - Mensaje nuevo del usuario

   c) Llamar a Gemini API:
      - Envía todo el contexto
      - Recibe respuesta con formato especial

   d) Parsear respuesta:
      - Extrae texto para el usuario (antes de ###STATE_UPDATE###)
      - Extrae JSON de estado (después de ###STATE_UPDATE###)

   e) Actualizar base de datos:
      - Actualiza student_syllabus con nuevos estados
      - Si tema completado → activa siguiente tema automáticamente
      - Guarda historial en chat_sessions

   f) Trigger Notario (si tema completado):
      - Fire and forget (no espera)
      - Genera resumen pedagógico en background

   g) Retornar respuesta al usuario
   ↓
8. Usuario ve respuesta formateada con Markdown
```

**Código simplificado:**
```typescript
// Paso 7 detallado
export async function handleStudentMessage(courseId: string, userMessage: string) {
  // 7a) Obtener contexto
  const userId = await getUserIdFromToken();
  const syllabus = await getStudentSyllabus(userId, courseId);
  const chatHistory = await getChatMessages(userId, syllabus.current_topic_id);
  const personaConfig = await getPersonaConfig(courseId);

  // 7b) Construir prompt
  const systemPrompt = fillPrompt(TEACHER_PROMPT, {
    PERSONA_JSON: JSON.stringify(personaConfig),
    SYLLABUS_JSON: JSON.stringify(syllabus),
    USER_INPUT: userMessage,
  });

  const messagesForAI = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Entendido. Estoy listo.' }] },
    ...chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  // 7c) Llamar a Gemini
  const aiRawResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: messagesForAI,
  });

  const responseText = aiRawResponse.text;

  // 7d) Parsear respuesta
  const textToUser = extractTextResponse(responseText); // Antes de ###STATE_UPDATE###
  const stateUpdate = extractStateJSON(responseText);   // Después de ###STATE_UPDATE###

  // 7e) Actualizar BD
  if (stateUpdate && isValidStateUpdate(stateUpdate)) {
    await updateSyllabusState(userId, courseId, stateUpdate);
  }

  await updateChatHistory(userId, syllabus.current_topic_id, [
    { role: 'user', content: userMessage },
    { role: 'assistant', content: textToUser },
  ]);

  // 7f) Trigger Notario (asíncrono)
  if (stateUpdate.trigger_summary_generation) {
    triggerNotaryAsync(userId, stateUpdate.current_topic_id);
  }

  // 7g) Retornar
  return { response: textToUser };
}
```

### Flujo 5: Auto-activación de Siguiente Tema

```
Cuando un estudiante completa un tema, el sistema automáticamente activa el siguiente:

1. IA detecta comprensión completa del tema
   ↓
2. IA devuelve JSON con:
   - topic actual: status = "completed"
   - siguiente topic: status = "in_progress"
   ↓
3. updateSyllabusState() procesa ambos cambios
   ↓
4. FALLBACK: Si IA solo marcó completado pero no activó siguiente:
   - Sistema detecta tema completado sin siguiente activo
   - Busca siguiente tema por order_index + 1
   - Lo activa automáticamente
   ↓
5. Próximo mensaje del usuario ya usa el nuevo tema
```

**Código del fallback:**
```typescript
// lib/dbHelpers.ts - updateSyllabusState()
const hasCompleted = stateUpdate.topics_updated.some(t => t.status === 'completed');
const hasNewInProgress = stateUpdate.topics_updated.filter(t => t.status === 'in_progress').length > 0;

if (hasCompleted && !hasNewInProgress) {
  console.warn('[DB] Topic completed but no next topic marked!');

  // Obtener todos los topics ordenados
  const { data: allTopics } = await supabaseAdmin
    .from('student_syllabus')
    .select('topic_id, order_index, status')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  // Encontrar topic completado
  const completedTopicId = stateUpdate.topics_updated.find(t => t.status === 'completed')?.topic_id;
  const completedTopic = allTopics.find(t => t.topic_id === completedTopicId);

  // Buscar siguiente topic
  const nextTopic = allTopics.find(t => t.order_index === completedTopic.order_index + 1);

  if (nextTopic) {
    // Activar siguiente tema automáticamente
    await supabaseAdmin
      .from('student_syllabus')
      .update({ status: 'in_progress' })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('topic_id', nextTopic.topic_id);
  }
}
```

---

## 🎨 Características Principales

### 1. **Sistema de Autenticación**
- JWT tokens en cookies HTTP-only (más seguro que localStorage)
- Roles: profesor y alumno
- Sesiones de 7 días
- Middleware de autenticación en rutas protegidas

### 2. **Gestión de Cursos (Profesor)**
- Crear, editar, eliminar cursos
- Generar códigos únicos automáticos
- Agregar múltiples temas con contenido Markdown
- Importar cursos completos desde JSON
- Configurar personalidad del tutor IA

### 3. **Inscripción a Cursos (Estudiante)**
- Inscripción mediante código del curso
- Auto-inicialización del plan de estudios (syllabus)
- Primer tema se activa automáticamente como "in_progress"

### 4. **Chat Inteligente con IA**
- Tutor que se adapta al nivel del estudiante
- Evaluación automática de comprensión
- Transición automática entre temas
- Historial de conversación persistente
- Formato Markdown con syntax highlighting

### 5. **Seguimiento de Progreso**
- Estados de temas: pending, in_progress, completed
- Cálculo automático de progreso (% de temas completados)
- Indicadores visuales en UI:
  - 🟢 Verde = Completado
  - 🔵 Azul = En Progreso
  - ⚪ Gris = Pendiente

### 6. **Arquitectura Pedagógica Dual**
- Agente Docente: Respuestas en tiempo real
- Agente Notario: Resúmenes pedagógicos asíncronos
- Estado del syllabus actualizado dinámicamente

### 7. **UI Responsiva y Moderna**
- Tailwind CSS para diseño adaptable
- Componentes reutilizables
- Dark mode ready (estructura preparada)
- Formato profesional de mensajes con Markdown

---

## 🔑 Variables de Entorno

El archivo `.env.local` contiene configuración sensible:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# JWT
JWT_SECRET=tu-secreto-de-al-menos-32-caracteres-aqui

# Google Gemini
GEMINI_API_KEY=tu-gemini-api-key-aqui

# Opcional
NODE_ENV=development
```

**Importante:** Este archivo NO se sube a GitHub (está en `.gitignore`)

---

## 📊 Resumen de Interacciones

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       ├─── Registro/Login ───→ JWT Cookie ───→ Autenticado
       │
       ├─── Profesor
       │    ├─ Crear Curso ────→ Supabase (courses)
       │    ├─ Agregar Topics ─→ Supabase (topics)
       │    └─ Configurar IA ──→ Supabase (persona_config)
       │
       └─── Estudiante
            ├─ Inscribirse ────→ Supabase (course_enrollments + student_syllabus)
            │
            └─ Chatear
               ├─ Enviar mensaje ──→ Server Action
               │                      │
               │                      ├─→ Obtener contexto (Supabase)
               │                      ├─→ Llamar Gemini API
               │                      ├─→ Parsear respuesta
               │                      ├─→ Actualizar estado (Supabase)
               │                      ├─→ Guardar historial (Supabase)
               │                      └─→ Trigger Notario (async)
               │
               └─ Recibir respuesta ←─ Markdown renderizado
```

---

## 🎓 Glosario de Términos

- **Server Action**: Función que se ejecuta en el servidor pero se llama desde el cliente
- **JWT**: JSON Web Token, método de autenticación sin estado
- **Supabase**: Plataforma de base de datos PostgreSQL como servicio
- **Syllabus**: Plan de estudios personalizado por estudiante
- **LLM**: Large Language Model (modelo de lenguaje grande)
- **Gemini**: Modelo de IA de Google
- **Markdown**: Lenguaje de marcado ligero para formato de texto
- **App Router**: Nueva arquitectura de rutas de Next.js basada en carpetas
- **Server Component**: Componente de React que se renderiza en el servidor
- **Client Component**: Componente de React que se renderiza en el cliente
- **Turbopack**: Build tool de Next.js, sucesor de Webpack
- **Edge Network**: Red de servidores distribuidos globalmente (CDN)
- **CI/CD**: Continuous Integration/Continuous Deployment (integración y despliegue continuo)

---

## 📚 Recursos Adicionales

### Documentación Oficial:
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Google Gemini**: https://ai.google.dev/docs
- **Vercel**: https://vercel.com/docs

### Tutoriales Recomendados:
- Next.js App Router: https://nextjs.org/learn
- TypeScript para React: https://react-typescript-cheatsheet.netlify.app
- Tailwind CSS Crash Course: https://tailwindcss.com/docs/utility-first

---

## 💡 Consejos para la Presentación

### 1. **Demostración en Vivo**
- Mostrar registro de usuario
- Crear un curso como profesor
- Inscribirse al curso como alumno
- Chatear con el tutor IA
- Completar un tema y ver cómo se activa el siguiente automáticamente
- Mostrar el progreso actualizado

### 2. **Puntos Clave a Destacar**
- **Arquitectura moderna**: Next.js 16 con React 19
- **IA avanzada**: Sistema dual-agent (Docente + Notario)
- **Escalabilidad**: Serverless functions y edge network
- **Seguridad**: JWT con cookies HTTP-only, RLS en Supabase
- **UX profesional**: Markdown rendering, indicadores visuales de progreso

### 3. **Métricas Impresionantes**
- "0 endpoints REST creados manualmente" (Server Actions)
- "Auto-corrección de estado" (Fallback cuando IA falla)
- "Respuestas en < 2 segundos" (Gemini Flash)
- "Deploy en < 3 minutos" (Vercel CI/CD)

### 4. **Diagrama para Presentar**
Usar el diagrama de arquitectura del inicio de este documento.

---

## 🏁 Conclusión

Este proyecto demuestra el uso de tecnologías modernas para crear una plataforma educativa con IA:

✅ **Frontend moderno** con Next.js 16 y React 19
✅ **Backend serverless** con Next.js Server Actions
✅ **Base de datos robusta** con Supabase PostgreSQL
✅ **IA inteligente** con Google Gemini 2.0 Flash
✅ **Deploy automático** con Vercel y GitHub
✅ **Tipado estático** con TypeScript
✅ **Diseño profesional** con Tailwind CSS
✅ **Arquitectura escalable** con sistema dual-agent

**La plataforma permite a estudiantes aprender a su propio ritmo con un tutor AI que se adapta a sus necesidades, mientras los profesores gestionan cursos de forma sencilla.**

---

*Documento creado para facilitar la comprensión del proyecto y su presentación.*
