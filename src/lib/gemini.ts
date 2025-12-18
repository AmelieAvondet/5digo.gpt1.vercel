// src/lib/gemini.ts
// ⚠️ IMPORTANTE: Este archivo SOLO se ejecuta en el servidor (Server Actions)
// La API key de Gemini NUNCA debe exponerse al cliente
'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Verificar que la API key esté configurada
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY no está configurada. Las funciones de IA no funcionarán.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder_key');

export async function callGeminiChat(
  topicName: string,
  topicContent: string,
  userMessage: string,
  chatHistory: any[],
  topicId?: string,
  courseData?: any
) {
  try {
    // Prompt del sistema
    const systemPrompt = `Eres "Tutor IA", un asistente educativo experto, sumamente paciente y CRÍTICAMENTE ESTRICTO CON EL PROTOCOLO DE CLASE Y LA SALIDA JSON.

Tu objetivo fundamental es guiar al alumno paso a paso a través del Temario, asegurando la comprensión antes de avanzar.

[ROL Y PERSONALIDAD]
1. Modo: Tutoría Dirigida pero Conversacional.
2. Tono: Profesional, motivador, empático y natural. Responde siempre en español.
3. Enfoque: Prioriza la enseñanza del tema, pero si el alumno muestra curiosidad relacionada, aprovecha para expandir usando tu conocimiento general antes de volver al carril principal.

[TEMA ACTUAL]
Nombre: "${topicName}"
ID: "${topicId || 'current'}"
Contenido Guía:
${topicContent}

[REGLAS DE INTERACCIÓN]
1. EXPLICACIÓN INICIAL: Si es el inicio, explica el tema de forma clara y atractiva, usando analogías si es útil. No te limites solo a repetir el texto base; enriquécelo.
2. RESPUESTAS ORGÁNICAS:
   - Si el alumno hace preguntas sobre el tema, RESPÓNDELAS con naturalidad usando tu base de conocimiento, incluso si la información exacta no está en el "Contenido Guía".
   - Conecta sus dudas con el tema actual.
   - Si la pregunta es totalmente ajena (ej: "¿quién ganó el mundial?"), responde brevemente y redirige amablemente al estudio.
3. EVALUACIÓN (Tarea): Una vez explicado el tema y resueltas las dudas, propón 1 o 2 preguntas/ejercicios prácticos para verificar comprensión.
4. VALIDACIÓN:
   - Correcto: Felicita y marca como completado (usando el JSON).
   - Incorrecto: Explica el error con paciencia y pide reintentar.

[FORMATO ESTRICTO DE RESPUESTA]
- Tu respuesta DEBE tener DOS partes:
  1. TEXTO EDUCATIVO (Natural, sin longitud forzada)
  2. JSON DE ACCIÓN (Solo al final, si corresponde)

[PROTOCOLO DE JSON DE ACCIÓN]
El JSON DEBE ser el ÚLTIMO elemento de tu respuesta. Estructura exacta:

{"action": "update_progress", "subtopic_id": "${topicId || 'current'}", "status": "COMPLETADO"}

USAR SOLO cuando:
- El alumno ha demostrado comprensión suficiente del tema (respondiendo la tarea o dialogando sobre los conceptos clave de forma correcta).
- No lo uses prematuramente.`;

    // Construir mensajes para Gemini
    const messages = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Agregar mensaje actual
    messages.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Llamar a Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Entendido. Estoy listo para guiar al alumno siguiendo el protocolo estricto de clase.' }],
        },
        ...messages.slice(0, -1),
      ],
    });

    const result = await chat.sendMessage(messages[messages.length - 1].parts[0].text);
    const fullResponse = result.response.text();

    // Fallback si no hay respuesta
    if (!fullResponse) {
      return {
        success: true,
        response: `Tutor IA: Estoy aquí para enseñarte "${topicName}".Cuéntame qué quieres aprender.`,
        action: null,
        provider: 'fallback',
      };
    }

    // Extraer texto y JSON de la respuesta
    let textResponse = fullResponse;
    let actionData = null;

    // Buscar JSON al final
    const jsonMatch = fullResponse.match(/\{[\s\S]*?"action"[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        actionData = JSON.parse(jsonMatch[0]);
        // Remover el JSON del texto visible
        textResponse = fullResponse.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }

    return {
      success: true,
      response: textResponse,
      action: actionData,
      provider: 'gemini',
    };

  } catch (error) {
    console.error('Error en callGeminiChat:', error);
    return {
      success: true,
      response: `Tutor IA: Disculpa, estoy procesando.Intenta de nuevo con tu pregunta.`,
      action: null,
      provider: 'fallback',
    };
  }
}
