// src/app/courses/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { enrollInCourse, getStudentCourses } from '@/app/student/actions';
import AdminHeader from '@/components/AdminHeader';

interface Course {
  enrollmentId: string;
  id: string;
  name: string;
  description: string;
  code: string;
  progress: number;
  teacher: string;
  created_at: string;
}

export default function CoursesPage() {
  const [courseCode, setCourseCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const router = useRouter();

  // Cargar cursos inscritos
  useEffect(() => {
    async function loadCourses() {
      const result = await getStudentCourses();
      if (!result.error) {
        setCourses(result.courses || []);
      }
      setLoadingCourses(false);
    }
    loadCourses();
  }, []);

  const handleJoinCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!courseCode.trim()) {
      setError('Ingresa un código de curso');
      return;
    }

    setLoading(true);

    try {
      const result = await enrollInCourse(courseCode);
      if (result.error) {
        setError(result.error);
      } else {
        setCourseCode('');
        // Recargar la lista de cursos
        const updated = await getStudentCourses();
        setCourses(updated.courses || []);
      }
    } catch (err: any) {
      setError('Error al unirse al curso');
    }

    setLoading(false);
  };

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    // Implementar cierre de sesión
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header personalizado */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tutor IA</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Unirse a curso
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                       Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal para unirse a curso */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Unirse a un Curso</h2>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setError('');
                  setCourseCode('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Ingresa el código del curso que te haya compartido tu profesor
            </p>

            <form onSubmit={handleJoinCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Curso
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  placeholder="Ej: COURSE-ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
              >
                {loading ? 'Uniéndose...' : 'Unirse'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mis Cursos</h2>
        </div>

        {loadingCourses ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Cargando cursos...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">No estás inscrito en ningún curso aún</p>
            <p className="text-gray-500 text-sm">
              Usa el botón "Unirse a curso" en la parte superior para unirte a un curso
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link
                key={course.enrollmentId}
                href={`/courses/${course.id}`}
                className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-blue-500 hover:shadow-lg transition-all group"
              >
                {/* Nombre del Curso */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition min-h-[3.5rem]">
                  {course.name}
                </h3>

                {/* Profesor */}
                <p className="text-sm text-gray-600 mb-4">
                  Profesor: <span className="font-medium text-gray-900">{course.teacher}</span>
                </p>

                {/* Barra de Progreso */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600">Barra de Progreso</span>
                    <span className="text-xs font-bold text-blue-600">{Math.round(course.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
