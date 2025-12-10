// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callGeminiChat } from '../../../lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topicName,
      topicContent,
      userMessage,
      chatHistory,
      topicId,
      courseData
    } = body;

    const result = await callGeminiChat(
      topicName,
      topicContent,
      userMessage,
      chatHistory,
      topicId,
      courseData
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en API de chat:', error);
    return NextResponse.json({
      success: true,
      response: `Tutor IA: Disculpa, estoy procesando. Intenta de nuevo con tu pregunta.`,
      action: null,
      provider: 'fallback',
    }, { status: 500 });
  }
}
