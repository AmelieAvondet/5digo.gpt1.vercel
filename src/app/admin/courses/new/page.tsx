// src/app/admin/courses/new/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCourse } from '@/app/admin/actions';

export default function NewCoursePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Generar código automático
  const generateCode = () => {
    const newCode = 'COURSE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setCode(newCode);
  };

  // Generar código cuando se carga la página
  useEffect(() => {
    generateCode();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !code) {
      setError('El nombre y código son requeridos');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('description', description);
      formData.set('code', code);

      const result = await createCourse(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Curso creado exitosamente
      router.push(`/admin/courses/${result.courseId}`);
    } catch (err: any) {
      setError('Error al crear el curso');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="text-blue-600 hover:text-blue-700">
              ← Volver
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Curso</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Curso *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Fundamentos de JavaScript"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el contenido del curso..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código del Curso * <span className="text-gray-500">(generado automáticamente)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  value={code}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-gray-700"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium"
                  title="Generar un nuevo código automáticamente"
                >
                  🔄 Regenerar
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
              >
                {loading ? 'Creando...' : 'Crear Curso'}
              </button>
              <Link
                href="/admin/courses"
                className="flex-1 text-center border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
