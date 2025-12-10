// src/app/admin/courses/[id]/topics/[topicId]/edit/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateTopic, deleteTopic } from '@/app/admin/actions';
import { supabaseAdmin } from '@/lib/supabase';
import AdminHeader from '@/components/AdminHeader';

export default function EditTopicPage() {
  const params = useParams();
  const courseId = params.id as string;
  const topicId = params.topicId as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [activities, setActivities] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTopic() {
      try {
        const { data: topic, error: topicError } = await supabaseAdmin
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .single();

        if (topicError) throw topicError;

        setName(topic.name);
        setContent(topic.content);
        setActivities(topic.activities || '');
      } catch (err: any) {
        setError('Error al cargar el temario');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [topicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !content) {
      setError('Nombre y contenido son requeridos');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('content', content);
      formData.set('activities', activities);

      const result = await updateTopic(topicId, formData);

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      // Actualización exitosa
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      setError('Error al actualizar el temario');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este temario? Esta acción no se puede deshacer.')) {
      return;
    }

    setSaving(true);

    try {
      const result = await deleteTopic(topicId);

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      // Eliminación exitosa
      router.push(`/admin/courses/${courseId}`);
    } catch (err: any) {
      setError('Error al eliminar el temario');
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
        title="✏️ Editar Temario"
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
                Nombre del Temario
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
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Temario
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="activities" className="block text-sm font-medium text-gray-700 mb-2">
                Actividades Sugeridas
              </label>
              <textarea
                id="activities"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
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
                {saving ? 'Eliminando...' : 'Eliminar Temario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
