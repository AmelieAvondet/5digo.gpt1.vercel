// Archivo: lib/notaryAgent.ts
// Agente Notario: Genera resúmenes pedagógicos en background (asíncrono)

import { GoogleGenAI } from "@google/genai";
import { NOTARY_PROMPT, fillPrompt } from '@/lib/prompts';
import { cleanAndParseJSON } from '@/lib/stateParser';
import { getChatHistoryForTopic, saveTopicSummary } from '@/lib/dbHelpers';

// Inicializar cliente de Gemini
const ai = new GoogleGenAI({});

/**
 * Ejecuta el Agente Notario en background (asíncrono)
 * NO bloquea la respuesta al usuario
 * Se activa solo cuando trigger_summary_generation === true
 */
export async function runNotaryProcess(
  studentId: string,
  topicId: string
): Promise<void> {
  try {
    console.log(
      `[Notary] Starting background process for topic ${topicId}, student ${studentId}`
    );

    // 1. Obtener historial de chat para este topic
    const chatTranscript = await getChatHistoryForTopic(studentId, topicId);

    if (!chatTranscript) {
      console.warn(
        `[Notary] No chat transcript found for topic ${topicId}`
      );
      return;
    }

    // 2. Construir prompt del Notario con el historial
    const notaryPromptFilled = fillPrompt(NOTARY_PROMPT, {
      CHAT_HISTORY: chatTranscript,
    });

    // 3. Llamar a la API de Gemini
    console.log('[Notary] Calling Gemini to generate summary...');
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: notaryPromptFilled }],
        },
      ],
    } as any);

    const summaryRawJSON = response.text || '';

    if (!summaryRawJSON) {
      console.error('[Notary] Empty response from Gemini');
      return;
    }

    // 4. Limpiar y parsear JSON
    const summaryData = cleanAndParseJSON(summaryRawJSON);

    if (!summaryData) {
      console.error('[Notary] Failed to parse summary JSON');
      return;
    }

    // 5. Guardar en la base de datos
    const saved = await saveTopicSummary(studentId, topicId, summaryData);

    if (saved) {
      console.log(
        `[Notary] ✓ Summary saved successfully for topic ${topicId}`
      );
    } else {
      console.error(`[Notary] ✗ Failed to save summary for topic ${topicId}`);
    }
  } catch (error) {
    console.error('[Notary] Exception in runNotaryProcess:', error);
    // No lanzar error para no afectar la respuesta al usuario
  }
}

/**
 * Wrapper para ejecutar el Notario sin bloquear
 * Se usa dentro de handleStudentMessage
 */
export function triggerNotaryAsync(
  studentId: string,
  topicId: string
): void {
  // Fire and Forget: Lanzar el proceso sin await
  // Si hay error, se logea pero no afecta al usuario
  runNotaryProcess(studentId, topicId).catch((err) => {
    console.error('[Notary] Async error:', err);
  });
}
