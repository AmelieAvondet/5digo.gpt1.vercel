// src/app/courses/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudentCourseDetails, dropCourse } from '@/app/student/actions';
import AdminHeader from '@/components/AdminHeader';

interface Topic {
  id: string;
  name: string;
  content: string;
  activities?: string;
  created_at: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface CourseDetails {
  id: string;
  name: string;
  description: string;
  code: string;
  teacher: string;
  created_at: string;
}

export default function StudentCourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDetails() {
      const result = await getStudentCourseDetails(courseId);

      if (result.error) {
        setError(result.error);
      } else if (result.course) {
        setCourse(result.course);
        setTopics(result.topics || []);
        setProgress(result.progress || 0);
      }

      setLoading(false);
    }

    loadDetails();
  }, [courseId]);

  const handleDropCourse = async () => {
    if (!confirm('¿Estás seguro de que deseas abandonar este curso? No podrás recuperar tu progreso.')) {
      return;
    }

    const result = await dropCourse(courseId);
    if (result.success) {
      router.push('/courses');
    } else {
      alert(result.error);
    }
  };

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
        backLink="/courses"
        backText="← Volver a Mis Cursos"
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium">Profesor</p>
              <p className="text-lg text-gray-900 mt-2">{course.teacher}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Código del Curso</p>
              <p className="text-lg font-mono bg-blue-50 text-blue-700 px-3 py-2 rounded mt-2 inline-block">
                {course.code}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Fecha de Inscripción</p>
              <p className="text-lg text-gray-900 mt-2">
                {new Date(course.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {course.description && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 font-medium mb-2">Descripción</p>
              <p className="text-gray-700 whitespace-pre-wrap">{course.description}</p>
            </div>
          )}

          {/* Progress Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-gray-700">Tu Progreso en el Curso</p>
              <p className="text-lg font-semibold text-gray-900">{Math.round(progress)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Temarios Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Temarios del Curso</h2>

          {topics.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No hay temarios disponibles aún
            </p>
          ) : (
            <div className="space-y-4">
              {topics.map((topic, index) => {
                const status = topic.status || 'pending';
                const isCompleted = status === 'completed';
                const isInProgress = status === 'in_progress';
                const isPending = status === 'pending';

                return (
                  <Link
                    key={topic.id}
                    href={`/courses/${courseId}/topics/${topic.id}`}
                    className={`block border-2 rounded-lg p-4 transition ${
                      isCompleted
                        ? 'border-green-300 bg-green-50 hover:border-green-400'
                        : isInProgress
                        ? 'border-blue-400 bg-blue-50 hover:border-blue-500 hover:shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                          <span className={`inline-flex items-center justify-center rounded-full w-8 h-8 text-sm font-bold mr-3 ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isInProgress
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </span>
                          {topic.name}
                          {isInProgress && (
                            <span className="ml-3 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                              En Progreso
                            </span>
                          )}
                          {isCompleted && (
                            <span className="ml-3 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              Completado
                            </span>
                          )}
                        </h3>
                        <p className={`text-sm line-clamp-2 ${
                          isPending ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {topic.content}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <svg
                          className={`w-5 h-5 ${
                            isCompleted ? 'text-green-500' : isInProgress ? 'text-blue-500' : 'text-gray-400'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                    {topic.activities && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">📝 Actividades incluidas:</p>
                        <p className="text-xs text-blue-800 line-clamp-2">
                          {topic.activities}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Drop Course Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Abandonar Curso</h3>
              <p className="text-gray-600 text-sm mt-1">
                Si abandonas el curso, perderás tu progreso
              </p>
            </div>
            <button
              onClick={handleDropCourse}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Abandonar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
