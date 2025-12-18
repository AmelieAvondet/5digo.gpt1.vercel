// src/app/admin/courses/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourseDetails } from '@/app/admin/actions';
import AdminHeader from '@/components/AdminHeader';

interface Topic {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  progress: number;
  created_at?: string;
  student?: {
    email: string;
  };
}

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDetails() {
      const result = await getCourseDetails(courseId);

      if (result.error) {
        setError(result.error);
      } else {
        setCourse(result.course);
        setTopics(result.topics || []);
        setEnrollments(result.enrollments || []);
      }

      setLoading(false);
    }

    loadDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando detalles del curso...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">Error al cargar el curso</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader
        title={course.name}
        backLink="/admin/courses"
        backText="← Volver a Mis Cursos"
        rightAction={{
          label: '✏️ Editar',
          href: `/admin/courses/${courseId}/edit`,
          variant: 'secondary',
        }}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Información del Curso */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Código del Curso</p>
              <p className="text-lg font-mono bg-blue-50 text-blue-700 px-3 py-2 rounded mt-2 inline-block">
                {course.code}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Fecha de Creación</p>
              <p className="text-lg text-gray-900 mt-2">
                {new Date(course.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          {course.description && (
            <div>
              <p className="text-sm text-gray-500 font-medium mb-2">Descripción</p>
              <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
            </div>
          )}
        </div>

        {/* Temarios Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Temarios</h2>
            <Link
              href={`/admin/courses/${courseId}/topics/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Añadir Temario
            </Link>
          </div>

          {topics.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay temarios aún. ¡Crea el primero!
            </p>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {topic.name}
                      </h3>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {topic.content}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/courses/${courseId}/topics/${topic.id}/edit`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Alumnos Inscritos</h2>

          {enrollments.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay alumnos inscritos aún. Comparte el código: <span className="font-mono bg-gray-100 px-2 py-1 rounded font-semibold">{course.code}</span>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="mb-3">
                    {enrollment.student?.email ? (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">👤</span>
                        <span className="font-semibold text-gray-900 break-all">{enrollment.student.email}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-900">ID: {enrollment.student_id.slice(0, 8)}...</span>
                    )}
                    <span className="text-xs text-gray-500 block">ID: {enrollment.student_id.slice(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso</span>
                    <span className="text-sm font-semibold text-gray-900">{enrollment.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
