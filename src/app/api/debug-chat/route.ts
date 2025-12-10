import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { TEACHER_PROMPT } from '@/lib/prompts';
import { extractTextResponse, extractStateJSON, isValidStateUpdate } from '@/lib/stateParser';

// Inicializar cliente de Gemini
const ai = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const { userMessage } = await request.json();
    
    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage required' }, { status: 400 });
    }

    console.log('=== DEBUG CHAT ===');
    console.log('User message:', userMessage);

    // Mock syllabus for testing
    const mockSyllabus = {
      current_topic_id: 'sub1_1',
      topics: [
        { topic_id: 'sub1_1', name: 'Variables', status: 'in_progress' },
        { topic_id: 'sub1_2', name: 'Operadores', status: 'pending' },
        { topic_id: 'sub1_3', name: 'Condicionales', status: 'pending' },
      ]
    };

    const mockPersona = {
      name: 'Maestro',
      style: 'encouraging',
      language: 'spanish'
    };

    // Fill TEACHER_PROMPT with test data
    const filledPrompt = TEACHER_PROMPT
      .replace('{current_topic}', mockSyllabus.topics.find(t => t.topic_id === mockSyllabus.current_topic_id)?.name || 'Unknown')
      .replace('{topic_list}', mockSyllabus.topics.map(t => `- ${t.name} (${t.topic_id}): ${t.status}`).join('\n'))
      .replace('{persona_name}', mockPersona.name)
      .replace('{persona_style}', mockPersona.style)
      .replace('{persona_language}', mockPersona.language);

    console.log('=== PROMPT ENVIADO A GEMINI ===');
    console.log(filledPrompt);
    console.log('=== FIN PROMPT ===');

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: filledPrompt },
            { text: userMessage }
          ]
        }
      ]
    });

    const rawResponse = (response as any).text || '';
    console.log('=== RESPUESTA DE GEMINI ===');
    console.log(rawResponse);

    // Parse response
    const textToUser = extractTextResponse(rawResponse);
    const stateUpdate = extractStateJSON(rawResponse);

    console.log('=== PARSED TEXT ===');
    console.log(textToUser);
    console.log('=== PARSED JSON ===');
    console.log(stateUpdate);

    const isValid = stateUpdate && isValidStateUpdate(stateUpdate);
    console.log('=== IS VALID ===');
    console.log(isValid);

    return NextResponse.json({
      success: true,
      rawResponse,
      parsedText: textToUser,
      parsedJSON: stateUpdate,
      isValid,
      validationDetails: {
        hasTrigger: stateUpdate?.trigger_summary_generation !== undefined,
        hasTopicId: stateUpdate?.current_topic_id !== undefined,
        hasTopicsArray: Array.isArray(stateUpdate?.topics_updated)
      }
    });

  } catch (error: any) {
    console.error('=== DEBUG CHAT ERROR ===', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
