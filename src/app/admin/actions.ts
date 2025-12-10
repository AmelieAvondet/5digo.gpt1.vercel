// src/app/admin/actions.ts
"use server";

import { supabaseAdmin } from '@/lib/supabase';
import { getUserIdFromToken } from '@/lib/auth';

// ============ CURSOS ============

// Crear nuevo curso
export async function createCourse(formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const code = formData.get('code') as string;

  if (!name || !code) {
    return { error: 'Nombre y código son requeridos' };
  }

  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert([{ teacher_id: teacherId, name, description, code }])
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, courseId: data.id };
  } catch (e: any) {
    console.error('Error al crear curso:', e.message);
    if (e.code === '23505') {
      return { error: 'El código del curso ya existe' };
    }
    return { error: e.message || 'Error al crear curso' };
  }
}

// Obtener todos los cursos del profesor
export async function getTeacherCourses() {
  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, courses: data || [] };
  } catch (e: any) {
    console.error('Error al obtener cursos:', e.message);
    return { error: e.message || 'Error al obtener cursos' };
  }
}

// Obtener detalles de un curso
export async function getCourseDetails(courseId: string) {
  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError) throw courseError;

    // Obtener temarios
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (topicsError) throw topicsError;

    // Obtener alumnos inscritos con su información de usuario
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('course_enrollments')
      .select(`
        id,
        student_id,
        progress,
        created_at,
        users:student_id (
          email
        )
      `)
      .eq('course_id', courseId);

    if (enrollmentsError) throw enrollmentsError;

    return { success: true, course, topics, enrollments };
  } catch (e: any) {
    console.error('Error al obtener detalles del curso:', e.message);
    return { error: e.message };
  }
}

// Actualizar curso
export async function updateCourse(courseId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return { error: 'El nombre es requerido' };
  }

  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    const { error } = await supabaseAdmin
      .from('courses')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .eq('teacher_id', teacherId);

    if (error) throw error;

    return { success: true };
  } catch (e: any) {
    console.error('Error al actualizar curso:', e.message);
    return { error: e.message };
  }
}

// Eliminar curso
export async function deleteCourse(courseId: string) {
  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('teacher_id', teacherId);

    if (error) throw error;

    return { success: true };
  } catch (e: any) {
    console.error('Error al eliminar curso:', e.message);
    return { error: e.message };
  }
}

// ============ TEMARIOS ============

// Crear temario
export async function createTopic(courseId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const content = formData.get('content') as string;
  const activities = formData.get('activities') as string;

  if (!name || !content) {
    return { error: 'Nombre y contenido son requeridos' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('topics')
      .insert([{ course_id: courseId, name, content, activities: activities || '[]' }])
      .select('id')
      .single();

    if (error) throw error;

    return { success: true, topicId: data.id };
  } catch (e: any) {
    console.error('Error al crear temario:', e.message);
    return { error: e.message };
  }
}

// Obtener temarios de un curso
export async function getTopicsByCourse(courseId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('topics')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, topics: data || [] };
  } catch (e: any) {
    console.error('Error al obtener temarios:', e.message);
    return { error: e.message };
  }
}

// Actualizar temario
export async function updateTopic(topicId: string, formData: FormData) {
  const name = formData.get('name') as string;
  const content = formData.get('content') as string;
  const activities = formData.get('activities') as string;

  if (!name || !content) {
    return { error: 'Nombre y contenido son requeridos' };
  }

  try {
    const { error } = await supabaseAdmin
      .from('topics')
      .update({ name, content, activities: activities || '[]', updated_at: new Date().toISOString() })
      .eq('id', topicId);

    if (error) throw error;

    return { success: true };
  } catch (e: any) {
    console.error('Error al actualizar temario:', e.message);
    return { error: e.message };
  }
}

// Eliminar temario
export async function deleteTopic(topicId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('topics')
      .delete()
      .eq('id', topicId);

    if (error) throw error;

    return { success: true };
  } catch (e: any) {
    console.error('Error al eliminar temario:', e.message);
    return { error: e.message };
  }
}

// ============ IMPORTAR CURSO DESDE JSON ============

export async function importCourseFromJSON(courseData: any) {
  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    // Validar estructura
    if (!courseData.curso_nombre || !Array.isArray(courseData.modulos)) {
      return { error: 'Estructura JSON inválida' };
    }

    // Generar código único para el curso
    const courseCode = 'COURSE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // Crear el curso
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert([{
        teacher_id: teacherId,
        name: courseData.curso_nombre,
        description: `Curso importado con ${courseData.modulos.length} módulos`,
        code: courseCode,
      }])
      .select('id')
      .single();

    if (courseError) {
      return { error: 'Error al crear el curso' };
    }

    // Crear todos los temarios basados en módulos y subtemas
    const topics = [];
    for (const modulo of courseData.modulos) {
      if (modulo.subtemas && Array.isArray(modulo.subtemas)) {
        for (const subtema of modulo.subtemas) {
          topics.push({
            course_id: course.id,
            name: `${modulo.nombre} - ${subtema.nombre}`,
            content: `**Módulo:** ${modulo.nombre}\n**Subtema:** ${subtema.nombre}\n\nID: ${subtema.id}`,
            activities: `Estudia el contenido de ${subtema.nombre}`,
          });
        }
      }
    }

    if (topics.length > 0) {
      const { error: topicsError } = await supabaseAdmin
        .from('topics')
        .insert(topics);

      if (topicsError) {
        console.error('Error al crear temarios:', topicsError);
        // No retornamos error aquí, el curso ya fue creado
      }
    }

    return { success: true, courseId: course.id };
  } catch (error) {
    console.error('Error en importCourseFromJSON:', error);
    return { error: 'Error al importar el curso' };
  }
}

// ============ SYLLABUS Y ESTADO PEDAGÓGICO ============

/**
 * Inicializa el Syllabus para un estudiante en un curso
 * Se llama cuando el estudiante se inscribe
 */
export async function initializeSyllabusForStudent(
  studentId: string,
  courseId: string
) {
  try {
    console.log(`[ADMIN] Initializing syllabus for student ${studentId} in course ${courseId}`);

    // Obtener todos los topics del curso
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (topicsError || !topics || topics.length === 0) {
      console.error('[ADMIN] Error fetching course topics:', topicsError);
      return { error: 'No se encontraron temas en el curso' };
    }

    // Crear entrada de Syllabus para cada topic
    const syllabusEntries = topics.map((topic, index) => ({
      student_id: studentId,
      course_id: courseId,
      topic_id: topic.id,
      status: index === 0 ? 'in_progress' : 'pending',
      order_index: index,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('student_syllabus')
      .insert(syllabusEntries);

    if (insertError) {
      console.error('[ADMIN] Error initializing syllabus:', insertError);
      return { error: 'Error al inicializar el plan de estudios' };
    }

    console.log(`[ADMIN] ✓ Syllabus initialized for student ${studentId}`);
    return { success: true, topicsCount: topics.length };
  } catch (error) {
    console.error('[ADMIN] Exception in initializeSyllabusForStudent:', error);
    return { error: 'Error al procesar la solicitud' };
  }
}

/**
 * Inicializa Syllabus para TODOS los estudiantes inscritos en un curso
 * Útil cuando se crea un curso nuevo y ya hay estudiantes
 */
export async function initializeSyllabusForAllStudents(courseId: string) {
  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    // Verificar que el profesor es dueño del curso
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError || !course) {
      return { error: 'No tienes permisos para este curso' };
    }

    console.log(`[ADMIN] Initializing syllabus for all students in course ${courseId}`);

    // Obtener todos los estudiantes inscritos
    const { data: enrollments, error: enrollError } = await supabaseAdmin
      .from('course_enrollments')
      .select('student_id')
      .eq('course_id', courseId);

    if (enrollError || !enrollments) {
      console.error('[ADMIN] Error fetching enrollments:', enrollError);
      return { error: 'Error al obtener inscritos' };
    }

    // Obtener todos los topics del curso
    const { data: topics, error: topicsError } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (topicsError || !topics || topics.length === 0) {
      return { error: 'No se encontraron temas en el curso' };
    }

    // Crear Syllabus para cada estudiante
    let successCount = 0;
    let failCount = 0;

    for (const enrollment of enrollments) {
      const syllabusEntries = topics.map((topic, index) => ({
        student_id: enrollment.student_id,
        course_id: courseId,
        topic_id: topic.id,
        status: index === 0 ? 'in_progress' : 'pending',
        order_index: index,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('student_syllabus')
        .insert(syllabusEntries)
        .select(); // Ignorar errores si ya existe

      if (insertError) {
        console.warn(`[ADMIN] Syllabus already exists for student ${enrollment.student_id}`);
        failCount++;
      } else {
        successCount++;
      }
    }

    console.log(
      `[ADMIN] ✓ Syllabus initialization complete: ${successCount} succeeded, ${failCount} skipped`
    );
    return {
      success: true,
      successCount,
      failCount,
      totalStudents: enrollments.length,
    };
  } catch (error) {
    console.error('[ADMIN] Exception in initializeSyllabusForAllStudents:', error);
    return { error: 'Error al procesar la solicitud' };
  }
}

/**
 * Configura la Persona pedagógica de un curso
 */
export async function setPersonaForCourse(
  courseId: string,
  personaConfig: {
    tone?: string;
    explanation_style?: string;
    language?: string;
    difficulty_level?: string;
  }
) {
  try {
    const teacherId = await getUserIdFromToken();
    if (!teacherId) {
      return { error: 'No estás autenticado' };
    }

    // Verificar que el profesor es dueño del curso
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('teacher_id', teacherId)
      .single();

    if (courseError || !course) {
      return { error: 'No tienes permisos para este curso' };
    }

    console.log(`[ADMIN] Setting persona for course ${courseId}`, personaConfig);

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('persona_configs')
      .select('id')
      .eq('course_id', courseId)
      .single();

    let result;
    if (existing) {
      // Update
      result = await supabaseAdmin
        .from('persona_configs')
        .update(personaConfig)
        .eq('course_id', courseId);
    } else {
      // Insert
      result = await supabaseAdmin
        .from('persona_configs')
        .insert([{ course_id: courseId, ...personaConfig }]);
    }

    if (result.error) {
      console.error('[ADMIN] Error setting persona:', result.error);
      return { error: 'Error al configurar la persona pedagógica' };
    }

    console.log(`[ADMIN] ✓ Persona set for course ${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('[ADMIN] Exception in setPersonaForCourse:', error);
    return { error: 'Error al procesar la solicitud' };
  }
}

