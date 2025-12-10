// src/app/admin/import-course/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import { importCourseFromJSON } from '@/app/admin/actions';

export default function ImportCoursePage() {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!jsonInput.trim()) {
      setError('Por favor ingresa el JSON del curso');
      return;
    }

    setLoading(true);

    try {
      // Parsear y validar JSON
      let courseData;
      try {
        courseData = JSON.parse(jsonInput);
      } catch (e) {
        setError('JSON inválido. Por favor verifica el formato.');
        setLoading(false);
        return;
      }

      // Validar estructura mínima
      if (!courseData.curso_nombre || !courseData.modulos) {
        setError('El JSON debe contener "curso_nombre" y "modulos"');
        setLoading(false);
        return;
      }

      // Importar el curso
      const result = await importCourseFromJSON(courseData);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`✅ Curso importado exitosamente! ID: ${result.courseId}`);
        setJsonInput('');
        setTimeout(() => {
          router.push(`/admin/courses/${result.courseId}`);
        }, 2000);
      }
    } catch (err: any) {
      setError('Error al importar el curso');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader
        title="📥 Importar Curso desde JSON"
        backLink="/admin/courses"
        backText="← Volver"
      />

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleImport} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="json" className="block text-sm font-medium text-gray-700 mb-2">
                JSON del Curso *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Estructura esperada: {"{ curso_nombre: string, modulos: [{ id, nombre, subtemas: [{ id, nombre }] }] }"}
              </p>
              <textarea
                id="json"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"curso_nombre": "Mi Curso", "modulos": [...]}'
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
              >
                {loading ? 'Importando...' : '📤 Importar Curso'}
              </button>
              <Link
                href="/admin/courses"
                className="flex-1 text-center bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancelar
              </Link>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm font-medium mb-2">📝 Formato esperado:</p>
              <pre className="text-blue-800 text-xs overflow-auto">
{`{
  "curso_nombre": "Nombre del Curso",
  "modulos": [
    {
      "id": "M01",
      "nombre": "Módulo 1",
      "subtemas": [
        {"id": "M01.1", "nombre": "Subtema 1"},
        {"id": "M01.2", "nombre": "Subtema 2"}
      ]
    }
  ]
}`}
              </pre>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
