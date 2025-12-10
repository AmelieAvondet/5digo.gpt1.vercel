// src/app/admin/courses/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTeacherCourses } from '@/app/admin/actions';
import AdminHeader from '@/components/AdminHeader';

interface Course {
  id: string;
  name: string;
  description: string;
  code: string;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCourses() {
      const result = await getTeacherCourses();

      if (result.error) {
        setError(result.error);
      } else {
        setCourses(result.courses || []);
      }

      setLoading(false);
    }

    loadCourses();
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header personalizado */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div> 
              <div>
              <h1 className="text-xl font-bold text-gray-900">Tutor IA</h1>
            </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/courses/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                + Crear Curso
              </Link>

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
                      Salir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Sección de Importar Curso */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">📥</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Importar Curso</h2>
              <p className="text-gray-600 text-sm mt-1">
                Importa un curso completo desde un archivo JSON con estructura de módulos y subtemas
              </p>
            </div>
          </div>
          <Link
            href="/admin/import-course"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            📄 Importar desde JSON
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747S17.5 6.253 12 6.253z" />
            </svg>
            <p className="text-gray-600 font-medium mb-2">No tienes cursos aún</p>
            <p className="text-gray-500 text-sm mb-4">
              Crea tu primer curso para empezar a enseñar
            </p>
            <Link
              href="/admin/courses/new"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Crear tu primer curso
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">N</span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {course.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Curso importado con {course.description ? '5' : '0'} módulos
                    </p>
                    <p className="text-sm text-gray-500">
                      Código: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{course.code}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                    >
                      Ver Detalles
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
