// Archivo: app/chat/loader.ts - Cargador de contexto de chat

"use server";

import { supabaseAdmin } from '@/lib/supabase';
import { getUserIdFromToken } from '@/lib/auth';

export async function loadAvailableTopics() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return { error: "No estás autenticado.", topics: [] };
    }

    // Obtener cursos en los que el estudiante está inscrito
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', userId);

    if (enrollError || !enrollments || enrollments.length === 0) {
      console.log(`[CHAT] No courses found for student`);
      return { topics: [] };
    }

    const courseIds = enrollments.map(e => e.course_id);

    // Obtener los cursos
    const { data: courses, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, name')
      .in('id', courseIds)
      .order('created_at', { ascending: false });

    if (courseError || !courses) {
      return { error: courseError?.message || "Error al cargar cursos", topics: [] };
    }

    // Transformar a formato de topics
    const topics = courses.map((course: any) => ({
      id: course.id,
      title: course.name,
      type: 'course',
    }));

    console.log(`[CHAT] Loaded ${topics.length} courses for student`);
    return { topics };
  } catch (error: any) {
    console.error(`[CHAT] Error en loadAvailableTopics:`, error.message);
    return { error: error.message, topics: [] };
  }
}
