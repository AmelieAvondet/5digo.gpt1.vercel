// src/app/student/actions.ts
"use server";

import { supabaseAdmin } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';

// ============ INSCRIPCIONES A CURSOS ============

// Inscribirse a un curso usando código
export async function enrollInCourse(courseCode: string) {
  if (!courseCode || !courseCode.trim()) {
    return { error: 'El código del curso es requerido' };
  }

  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    // Buscar el curso por código
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('code', courseCode.trim().toUpperCase())
      .single();

    if (courseError || !course) {
      return { error: 'Código de curso no válido' };
    }

    // Verificar si ya está inscrito
    const { data: existing } = await supabaseAdmin
      .from('course_enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', course.id)
      .single();

    if (existing) {
      return { error: 'Ya estás inscrito en este curso' };
    }

    // Crear la inscripción
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .insert([{ student_id: studentId, course_id: course.id, progress: 0 }])
      .select('id')
      .single();

    if (enrollError) {
      return { error: 'Error al inscribirse en el curso' };
    }

    // ===== NUEVO: Inicializar Syllabus automáticamente =====
    console.log(`[STUDENT] Initializing syllabus for student ${studentId} in course ${course.id}`);
    
    // Obtener todos los topics del curso
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('course_id', course.id)
      .order('created_at', { ascending: true });

    if (topicsError || !topics || topics.length === 0) {
      console.warn('[STUDENT] No topics found for course, skipping syllabus initialization');
      return { success: true, courseId: course.id, warning: 'Curso sin temas' };
    }

    // Crear entrada de Syllabus para cada topic
    const syllabusEntries = topics.map((topic, index) => ({
      student_id: studentId,
      course_id: course.id,
      topic_id: topic.id,
      status: index === 0 ? 'in_progress' : 'pending',
      order_index: index,
    }));

    const { error: syllabusError } = await supabaseAdmin
      .from('student_syllabus')
      .insert(syllabusEntries);

    if (syllabusError) {
      console.error('[STUDENT] Error initializing syllabus:', syllabusError);
      // No retornar error - la inscripción fue exitosa, solo falla el syllabus
    } else {
      console.log(`[STUDENT] ✓ Syllabus initialized with ${topics.length} topics`);
    }

    return { success: true, courseId: course.id };
  } catch (error) {
    console.error('Error en enrollInCourse:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}

// Obtener cursos inscritos del estudiante
export async function getStudentCourses() {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado', courses: [] };
    }

    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select(`
        id,
        progress,
        courses (
          id,
          name,
          description,
          code,
          created_at,
          users (
            email
          )
        )
      `)
      .eq('student_id', studentId);

    if (enrollError) {
      return { error: 'Error al cargar cursos', courses: [] };
    }

    const courses = enrollments?.map((e: any) => ({
      enrollmentId: e.id,
      id: e.courses.id,
      name: e.courses.name,
      description: e.courses.description,
      code: e.courses.code,
      progress: e.progress,
      teacher: e.courses.users?.email || 'Desconocido',
      created_at: e.courses.created_at,
    })) || [];

    return { success: true, courses };
  } catch (error) {
    console.error('Error en getStudentCourses:', error);
    return { error: 'Error al procesar tu solicitud', courses: [] };
  }
}

// Obtener detalles de un curso inscrito (con temarios)
export async function getStudentCourseDetails(courseId: string) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    // Verificar que está inscrito
    const { data: enrollment, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select('id, progress')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (enrollError || !enrollment) {
      return { error: 'No estás inscrito en este curso' };
    }

    // Obtener detalles del curso
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select(`
        id,
        name,
        description,
        code,
        created_at,
        users (
          email
        )
      `)
      .eq('id', courseId)
      .single();

    if (courseError) {
      return { error: 'Error al cargar el curso' };
    }

    // Obtener temarios
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('id, name, content, activities, created_at')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (topicsError) {
      return { error: 'Error al cargar los temarios' };
    }

    // Obtener el estado de cada topic desde student_syllabus
    const { data: syllabusData, error: syllabusError } = await supabaseAdmin
      .from('student_syllabus')
      .select('topic_id, status')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (syllabusError) {
      console.error('[STUDENT] Error loading syllabus:', syllabusError);
    }

    // Crear mapa de estados por topic_id
    const topicStatusMap = new Map<string, string>();
    syllabusData?.forEach(item => {
      topicStatusMap.set(item.topic_id, item.status);
    });

    // Calcular progreso real basado en topics completados
    const totalTopics = topics?.length || 0;
    const completedTopics = syllabusData?.filter(t => t.status === 'completed').length || 0;
    const realProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Agregar estado a cada topic
    const topicsWithStatus = topics?.map(topic => ({
      ...topic,
      status: (topicStatusMap.get(topic.id) || 'pending') as 'pending' | 'in_progress' | 'completed',
    })) || [];

    const teacherEmail = Array.isArray((course as any).users)
      ? (course as any).users[0]?.email || 'Desconocido'
      : (course as any).users?.email || 'Desconocido';

    return {
      success: true,
      course: {
        id: course.id,
        name: course.name,
        description: course.description,
        code: course.code,
        teacher: teacherEmail,
        created_at: course.created_at,
      },
      topics: topicsWithStatus,
      progress: realProgress,
    };
  } catch (error) {
    console.error('Error en getStudentCourseDetails:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}

// Abandonar un curso
export async function dropCourse(courseId: string) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    const { error } = await supabaseAdmin
      .from('course_enrollments')
      .delete()
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) {
      return { error: 'Error al abandonar el curso' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en dropCourse:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}

// ============ CHAT Y TEMARIOS ============

// Obtener detalles de un temario con historial de chat
export async function getTopicDetails(courseId: string, topicId: string) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    // Verificar que está inscrito en el curso
    const { data: enrollment } = await supabaseAdmin
      .from('course_enrollments')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .single();

    if (!enrollment) {
      return { error: 'No estás inscrito en este curso' };
    }

    // Obtener detalles del temario
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('topics')
      .select('id, name, content, activities, created_at')
      .eq('id', topicId)
      .eq('course_id', courseId)
      .single();

    if (topicError || !topic) {
      return { error: 'Temario no encontrado' };
    }

    // Obtener el estado del tema desde student_syllabus
    const { data: syllabusEntry } = await supabaseAdmin
      .from('student_syllabus')
      .select('status')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('topic_id', topicId)
      .single();

    const topicStatus = syllabusEntry?.status || 'in_progress';

    // Obtener o crear sesión de chat
    const { data: chatSession, error: chatError } = await supabaseAdmin
      .from('chat_sessions')
      .select('id, context_data')
      .eq('student_id', studentId)
      .eq('topic_id', topicId)
      .single();

    let sessionId = chatSession?.id;

    if (!sessionId) {
      // Crear nueva sesión
      const { data: newSession, error: newSessionError } = await supabaseAdmin
        .from('chat_sessions')
        .insert([{
          student_id: studentId,
          topic_id: topicId,
          context_data: JSON.stringify([]),
        }])
        .select('id')
        .single();

      if (newSessionError) {
        return { error: 'Error al crear sesión de chat' };
      }

      sessionId = newSession.id;
    }

    return {
      success: true,
      topic: {
        id: topic.id,
        name: topic.name,
        content: topic.content,
        activities: topic.activities,
        created_at: topic.created_at,
      },
      sessionId,
      chatHistory: chatSession?.context_data ? JSON.parse(chatSession.context_data) : [],
      topicStatus,
    };
  } catch (error) {
    console.error('Error en getTopicDetails:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}

// Guardar mensaje en el chat
export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    // Obtener la sesión actual
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('context_data')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return { error: 'Sesión no encontrada' };
    }

    // Agregar el nuevo mensaje
    const chatHistory = JSON.parse(session.context_data) || [];
    chatHistory.push({ role, content, timestamp: new Date().toISOString() });

    // Actualizar la sesión
    const { error: updateError } = await supabaseAdmin
      .from('chat_sessions')
      .update({ context_data: JSON.stringify(chatHistory) })
      .eq('id', sessionId);

    if (updateError) {
      return { error: 'Error al guardar el mensaje' };
    }

    return { success: true, chatHistory };
  } catch (error) {
    console.error('Error en saveChatMessage:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}

// Generar respuesta con Gemini API - Tutor IA Estricto
export async function generateAIResponse(
  topicName: string,
  topicContent: string,
  userMessage: string,
  chatHistory: any[],
  topicId?: string,
  courseData?: any
) {
  // Importar dinámicamente para asegurar que se ejecute en el servidor
  const { callGeminiChat } = await import('../../lib/gemini');

  return await callGeminiChat(
    topicName,
    topicContent,
    userMessage,
    chatHistory,
    topicId,
    courseData
  );
}


// Actualizar estado de un tema específico
export async function updateTopicStatus(
  courseId: string,
  topicId: string,
  status: 'pending' | 'in_progress' | 'completed'
) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    // Actualizar estado del tema en student_syllabus
    const { error: updateError } = await supabaseAdmin
      .from('student_syllabus')
      .update({ status })
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .eq('topic_id', topicId);

    if (updateError) {
      console.error('Error al actualizar estado del tema:', updateError);
      return { error: 'Error al actualizar estado del tema' };
    }

    // Calcular y actualizar progreso general del curso
    const { data: syllabusData } = await supabaseAdmin
      .from('student_syllabus')
      .select('status')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (syllabusData) {
      const totalTopics = syllabusData.length;
      const completedTopics = syllabusData.filter(t => t.status === 'completed').length;
      const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      // Actualizar progreso en course_enrollments
      await supabaseAdmin
        .from('course_enrollments')
        .update({ progress })
        .eq('student_id', studentId)
        .eq('course_id', courseId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error en updateTopicStatus:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}

// Actualizar progreso del estudiante (deprecated - usar updateTopicStatus)
export async function updateStudentProgress(courseId: string, progress: number) {
  try {
    const studentId = await getUserId();
    if (!studentId) {
      return { error: 'No estás autenticado' };
    }

    const { error } = await supabaseAdmin
      .from('course_enrollments')
      .update({ progress })
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (error) {
      return { error: 'Error al actualizar progreso' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error en updateStudentProgress:', error);
    return { error: 'Error al procesar tu solicitud' };
  }
}
