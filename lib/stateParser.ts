// Archivo: lib/stateParser.ts
// Utilidades para limpiar y parsear JSON del LLM

/**
 * Limpia respuestas de LLM que desobedecen instrucciones y agregan Markdown
 * Elimina bloques de código markdown (```json ... ```) y espacios innecesarios
 */
export function cleanAndParseJSON(str: string): any {
  if (!str) return null;

  try {
    // Elimina bloques de código markdown
    let cleaned = str
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Si tiene el delimitador, toma solo la parte del JSON
    if (cleaned.includes("###STATE_UPDATE###")) {
      const parts = cleaned.split("###STATE_UPDATE###");
      cleaned = parts[1]?.trim() || cleaned;
    }

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("CRITICAL: Failed to parse AI JSON State", e);
    console.error("Raw input was:", str);
    return null;
  }
}

/**
 * Extrae el texto de respuesta del LLM antes del delimitador STATE_UPDATE
 */
export function extractTextResponse(aiRawResponse: string): string {
  const delimiter = "###STATE_UPDATE###";

  if (!aiRawResponse.includes(delimiter)) {
    return aiRawResponse;
  }

  const [textPart] = aiRawResponse.split(delimiter);
  return textPart.trim();
}

/**
 * Extrae el JSON de estado después del delimitador
 */
export function extractStateJSON(aiRawResponse: string): any {
  const delimiter = "###STATE_UPDATE###";

  if (!aiRawResponse.includes(delimiter)) {
    return null;
  }

  const [, jsonPart] = aiRawResponse.split(delimiter);
  return cleanAndParseJSON(jsonPart);
}

/**
 * Interfaz para el estado del Syllabus
 */
export interface TopicState {
  topic_id: string;
  status: "pending" | "in_progress" | "completed";
  order_index: number;
}

export interface SyllabusState {
  syllabus_id: string;
  course_id: string;
  student_id: string;
  topics: TopicState[];
  current_topic_id: string;
}

export interface AIStateUpdate {
  trigger_summary_generation: boolean;
  current_topic_id: string;
  topics_updated: Array<{
    topic_id: string;
    status: "pending" | "in_progress" | "completed";
  }>;
}

/**
 * Valida que el JSON del estado sea válido
 */
export function isValidStateUpdate(obj: any): obj is AIStateUpdate {
  return (
    typeof obj === "object" &&
    typeof obj.trigger_summary_generation === "boolean" &&
    typeof obj.current_topic_id === "string" &&
    Array.isArray(obj.topics_updated)
  );
}
