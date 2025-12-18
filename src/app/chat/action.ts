// Archivo: app/chat/action.ts (Refactorizado con Arquitectura Pedagógica)
// Implementa el Orquestador: Agente Docente (síncrono) + Agente Notario (asíncrono)

"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';
import { TEACHER_PROMPT, fillPrompt } from '@/lib/prompts';
import {
  extractTextResponse,
  extractStateJSON,
  isValidStateUpdate,
  SyllabusState,
  AIStateUpdate,
} from '@/lib/stateParser';
import {
  getStudentSyllabus,
  getPersonaConfig,
  updateSyllabusState,
  getChatMessages,
  updateChatHistory,
  ChatMessage,
} from '@/lib/dbHelpers';
import { triggerNotaryAsync } from '@/lib/notaryAgent';

// ⚠️ Verificar que GEMINI_API_KEY está configurada (solo en servidor)
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY not configured. AI features will not work.');
}

// Inicializar cliente de Gemini de forma segura (solo en servidor)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// ============ FUNCIONES AUXILIARES ============

/**
 * Obtiene el userId del JWT de las cookies (migrado a @/lib/auth)
 * Esta función ahora delega a la función centralizada
 */
async function getUserIdFromTokenInternal(): Promise<string | null> {
  try {
    const userId = await getUserId();
    if (userId) {
      console.log(`[CHAT] UserId extracted from JWT: ${userId}`);
    } else {
      console.log(`[CHAT] No authentication token found`);
    }
    return userId;
  } catch (error) {
    console.error(`[CHAT] Error extracting userId from JWT:`, error);
    return null;
  }
}

// ============ ORQUESTADOR PRINCIPAL ============

/**
 * handleStudentMessage: Lógica principal del Sistema Educativo
 *
 * FLUJO:
 * 1. Validar autenticación
 * 2. Obtener Syllabus + Persona del estudiante
 * 3. Llamar Agente Docente (síncrono)
 * 4. Parsear respuesta (texto + JSON de estado)
 * 5. Actualizar Syllabus en BD (síncrono)
 * 6. RETORNAR respuesta al usuario (rápido)
 * 7. Trigger Notario en background SI es necesario (asíncrono, no bloquea)
 */
export async function handleStudentMessage(
  courseId: string,
  userMessage: string
): Promise<{ response: string; fullContext: any[]; isNewSession: boolean; error?: string }> {
  try {
    console.log(`[CHAT] Starting message handler: courseId=${courseId}`);

    // ===== PASO 1: Validar autenticación =====
    const userId = await getUserIdFromTokenInternal();
    if (!userId) {
      return {
        error: "No estás autenticado. Por favor inicia sesión.",
        response: "",
        fullContext: [],
        isNewSession: false,
      };
    }

    // ===== PASO 2: Obtener contexto pedagógico =====
    const syllabus = await getStudentSyllabus(userId, courseId);
    const personaConfig = await getPersonaConfig(courseId);

    if (!syllabus) {
      return {
        error: "No se encontró el plan de estudios. Contacta al profesor.",
        response: "",
        fullContext: [],
        isNewSession: false,
      };
    }

    console.log(
      `[CHAT] Syllabus loaded. Current topic: ${syllabus.current_topic_id}`
    );

    // ===== PASO 2.5: Cargar historial de chat =====
    const chatHistory = await getChatMessages(userId, syllabus.current_topic_id);
    console.log(`[CHAT] Chat history loaded. Messages: ${chatHistory.length}`);

    // ===== PASO 3: Construir y ejecutar Agente Docente =====
    // Construir historial de conversación para Gemini
    const conversationHistory = chatHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Agregar mensaje actual del usuario
    conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Construir prompt del sistema
    const systemPrompt = fillPrompt(TEACHER_PROMPT, {
      PERSONA_JSON: JSON.stringify(personaConfig),
      SYLLABUS_JSON: JSON.stringify(syllabus),
      USER_INPUT: '[Conversación en progreso - ver historial abajo]',
    });

    // Mensaje del sistema al inicio
    const messagesForAI = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Entendido. Estoy listo para ayudar al estudiante con el tema actual del syllabus.' }],
      },
      ...conversationHistory,
    ];

    console.log(`[CHAT] Calling Teacher Agent with ${messagesForAI.length} messages...`);
    const aiRawResponse = await model.generateContent({
      contents: messagesForAI,
    });

    const responseText = aiRawResponse.response.text();

    if (!responseText) {
      return {
        error: "No se pudo obtener respuesta de la IA.",
        response: "",
        fullContext: [],
        isNewSession: false,
      };
    }

    console.log(`[CHAT] Teacher Agent response received (${responseText.length} chars)`);
    console.log(`[CHAT] Raw response preview: ${responseText.substring(0, 200)}...`);

    // ===== PASO 4: Parsear respuesta (split texto + JSON) =====
    const textToUser = extractTextResponse(responseText);
    const stateUpdate = extractStateJSON(responseText);

    console.log(`[CHAT] Text extracted: ${textToUser.substring(0, 100)}...`);
    console.log(`[CHAT] State update extracted:`, JSON.stringify(stateUpdate, null, 2));

    // Debug adicional para troubleshooting
    if (stateUpdate) {
      console.log(`[CHAT] Topics updated count: ${stateUpdate.topics_updated?.length || 0}`);
      stateUpdate.topics_updated?.forEach((topic: any, index: number) => {
        console.log(`[CHAT]   Topic ${index + 1}: ${topic.topic_id} -> ${topic.status}`);
      });
    }

    // ===== PASO 5: Validar y actualizar Syllabus (síncrono) =====
    let updateSuccess = false;
    if (stateUpdate && isValidStateUpdate(stateUpdate)) {
      console.log(`[CHAT] State update is VALID. Updating syllabus...`);
      updateSuccess = await updateSyllabusState(userId, courseId, stateUpdate);
      if (!updateSuccess) {
        console.warn(`[CHAT] Failed to update syllabus in DB, but continuing...`);
      } else {
        console.log(`[CHAT] ✓ Syllabus updated successfully`);
      }
    } else {
      console.warn(`[CHAT] ⚠️  State update is INVALID or missing`);
      console.warn(`[CHAT] Raw state update:`, stateUpdate);
      
      // Fallback inteligente: mantener tema en in_progress
      const fallbackUpdate: AIStateUpdate = {
        trigger_summary_generation: false,
        current_topic_id: syllabus.current_topic_id,
        topics_updated: [
          {
            topic_id: syllabus.current_topic_id,
            status: 'in_progress',
          },
        ],
      };
      console.log(`[CHAT] Using fallback state update:`, fallbackUpdate);
      updateSuccess = await updateSyllabusState(userId, courseId, fallbackUpdate);
    }

    // ===== PASO 6: GUARDAR HISTORIAL DE CHAT =====
    const newMessages: ChatMessage[] = [
      {
        role: 'user',
        content: userMessage,
      },
      {
        role: 'assistant',
        content: textToUser,
      },
    ];

    const historySaved = await updateChatHistory(
      userId,
      syllabus.current_topic_id,
      newMessages
    );

    if (!historySaved) {
      console.warn(`[CHAT] Failed to save chat history`);
    } else {
      console.log(`[CHAT] ✓ Chat history saved`);
    }

    // ===== PASO 7: RETORNAR RESPUESTA AL USUARIO (rápido) =====
    console.log(`[CHAT] Returning response to user`);
    const response = {
      response: textToUser,
      fullContext: [],
      isNewSession: false,
    };

    // ===== PASO 8: TRIGGER Agente Notario (asíncrono, "fire and forget") =====
    if (
      stateUpdate.trigger_summary_generation === true &&
      stateUpdate.current_topic_id
    ) {
      console.log(
        `[CHAT] Triggering Notary background process for topic ${stateUpdate.current_topic_id}`
      );
      // NO ESPERAMOS (no await) - Solo lanzamos el proceso
      triggerNotaryAsync(userId, stateUpdate.current_topic_id);
    }

    return response;
  } catch (error: any) {
    console.error(`[CHAT] Exception in handleStudentMessage:`, error);
    return {
      error: `Error interno: ${error.message}`,
      response: "",
      fullContext: [],
      isNewSession: false,
    };
  }
}

// ============ INICIALIZAR CHAT =============
/**
 * initializeChatSession: Envía el primer mensaje del Tutor cuando el alumno abre un tema
 * Esto inicia la conversación sin esperar input del usuario
 */
export async function initializeChatSession(
  courseId: string
): Promise<{ response: string; error?: string }> {
  try {
    console.log(`[CHAT] Initializing chat session for course: ${courseId}`);

    const userId = await getUserIdFromTokenInternal();
    if (!userId) {
      return {
        error: "No estás autenticado.",
        response: "",
      };
    }

    // Obtener syllabus e identificar el tema actual
    const syllabus = await getStudentSyllabus(userId, courseId);
    if (!syllabus) {
      return {
        error: "No se encontró el plan de estudios.",
        response: "",
      };
    }

    // Obtener persona config
    const personaConfig = await getPersonaConfig(courseId);

    // Mensaje de inicialización vacío (el Tutor debe generar su introducción)
    const teacherPromptFilled = fillPrompt(TEACHER_PROMPT, {
      PERSONA_JSON: JSON.stringify(personaConfig),
      SYLLABUS_JSON: JSON.stringify(syllabus),
      USER_INPUT: "[SISTEMA: Esta es la primera interacción. Por favor, introduce el tema actual de forma amigable y motivadora. No esperes a que el estudiante pregunte.]",
    });

    const aiRawResponse = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: teacherPromptFilled }],
        },
      ],
    });

    const responseText = aiRawResponse.response.text();

    if (!responseText) {
      return {
        error: "No se pudo obtener respuesta de la IA.",
        response: "",
      };
    }

    // Parsear respuesta
    const textToUser = extractTextResponse(responseText);
    const stateUpdate = extractStateJSON(responseText);

    // Actualizar syllabus si es necesario
    if (stateUpdate && isValidStateUpdate(stateUpdate)) {
      await updateSyllabusState(userId, courseId, stateUpdate);
    }

    // Guardar mensaje inicial del tutor en el historial
    const initialMessage: ChatMessage = {
      role: 'assistant',
      content: textToUser,
    };

    const historySaved = await updateChatHistory(
      userId,
      syllabus.current_topic_id,
      [initialMessage]
    );

    if (!historySaved) {
      console.warn(`[CHAT] Failed to save initial message`);
    }

    console.log(`[CHAT] Chat session initialized successfully`);
    return {
      response: textToUser,
    };
  } catch (error: any) {
    console.error(`[CHAT] Error initializing chat session:`, error);
    return {
      error: `Error al inicializar: ${error.message}`,
      response: "",
    };
  }
}

// ============ COMPATIBLE CON API ANTERIOR =============
// Para mantener compatibilidad, mantenemos la función chatWithAI
// que llama internamente a handleStudentMessage

export async function chatWithAI(
  newMessage: string,
  cursoId: string
): Promise<{ response: string; fullContext: any[]; isNewSession: boolean; error?: string }> {
  console.log(`[CHAT] chatWithAI (legacy) called`);
  return handleStudentMessage(cursoId, newMessage);
}
