// src/app/admin/courses/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourseDetails, updateCourse, deleteCourse } from '@/app/admin/actions';
import AdminHeader from '@/components/AdminHeader';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      const result = await getCourseDetails(courseId);

      if (result.error) {
        setError(result.error);
      } else if (result.course) {
        setName(result.course.name);
        setDescription(result.course.description || '');
      }

      setLoading(false);
    }

    loadCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('El nombre es requerido');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('description', description);

      const result = await updateCourse(courseId, formData);

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      // Actualización exitosa
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      setError('Error al actualizar el curso');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
      return;
    }

    setSaving(true);

    try {
      const result = await deleteCourse(courseId);

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      // Eliminación exitosa
      router.push('/admin/courses');
    } catch (err: any) {
      setError('Error al eliminar el curso');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader
        title="✏️ Editar Curso"
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
                Nombre del Curso
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition font-semibold"
              >
                {saving ? 'Eliminando...' : 'Eliminar Curso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
