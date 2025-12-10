// src/app/admin/courses/[id]/topics/new/page.tsx
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createTopic } from '@/app/admin/actions';
import AdminHeader from '@/components/AdminHeader';

export default function NewTopicPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [activities, setActivities] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !content) {
      setError('Nombre y contenido son requeridos');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('content', content);
      formData.set('activities', activities);

      const result = await createTopic(courseId, formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Temario creado exitosamente
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      setError('Error al crear el temario');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader
        title="Crear Nuevo Temario"
        backLink={`/admin/courses/${courseId}`}
        backText="← Volver"
      />

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
                Nombre del Temario *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Variables y Tipos de Datos"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Temario *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe el contenido que los alumnos aprenderán con la IA..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-sm mt-2">
                Este contenido será usado por la IA para generar las explicaciones y respuestas
              </p>
            </div>

            <div>
              <label htmlFor="activities" className="block text-sm font-medium text-gray-700 mb-2">
                Actividades Sugeridas
              </label>
              <textarea
                id="activities"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="Ej: 1. Explica qué son las variables. 2. Da 3 ejemplos de tipos de datos..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
              >
                {loading ? 'Creando...' : 'Crear Temario'}
              </button>
              <Link
                href={`/admin/courses/${courseId}`}
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
