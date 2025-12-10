// Archivo: src/app/admin/persona/page.tsx
// Interfaz para configurar la Persona pedagógica de cursos

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherCourses, setPersonaForCourse } from '@/app/admin/actions';
import AdminHeader from '@/components/AdminHeader';

interface Course {
  id: string;
  name: string;
}

interface PersonaConfig {
  tone: 'profesional' | 'casual' | 'motivador';
  explanation_style: 'detallado' | 'conciso' | 'socrático';
  language: string;
  difficulty_level: 'basico' | 'intermedio' | 'avanzado';
}

export default function PersonaConfigPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const [persona, setPersona] = useState<PersonaConfig>({
    tone: 'motivador',
    explanation_style: 'detallado',
    language: 'es',
    difficulty_level: 'intermedio',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const result = await getTeacherCourses();
      if (result.success) {
        setCourses(result.courses as Course[]);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      setMessage('❌ Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setMessage('❌ Por favor selecciona un curso');
      return;
    }

    setSaving(true);
    setMessage('Guardando...');

    try {
      const result = await setPersonaForCourse(selectedCourse, persona);

      if (result.success) {
        setMessage('✅ Persona configurada exitosamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Error al guardar la configuración');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AdminHeader
        title="⚙️ Configurar Persona Pedagógica"
        backLink="/admin/courses"
        backText="← Volver a Cursos"
      />

      <div className="max-w-2xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Configurar Persona Pedagógica
          </h1>
          <p className="text-gray-600 mb-6">
            Define el tono y estilo de enseñanza de tu curso
          </p>

          <form onSubmit={handleSavePersona} className="space-y-6">
            {/* Selector de Curso */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selecciona un Curso
              </label>
              {loading ? (
                <div className="text-gray-600">Cargando cursos...</div>
              ) : courses.length === 0 ? (
                <div className="text-gray-600">No tienes cursos creados aún</div>
              ) : (
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Elige un curso --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tono de Voz */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tono de Voz
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['profesional', 'casual', 'motivador'] as const).map((tone) => (
                  <label
                    key={tone}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      persona.tone === tone
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={tone}
                      checked={persona.tone === tone}
                      onChange={(e) =>
                        setPersona({
                          ...persona,
                          tone: e.target.value as any,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="font-semibold capitalize">{tone}</span>
                    <p className="text-xs text-gray-600 mt-1">
                      {tone === 'profesional' && 'Formal, académico, riguroso'}
                      {tone === 'casual' && 'Relajado, amigable, conversacional'}
                      {tone === 'motivador' && 'Entusiasta, inspirador, supportivo'}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Estilo de Explicación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Estilo de Explicación
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['detallado', 'conciso', 'socrático'] as const).map((style) => (
                  <label
                    key={style}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      persona.explanation_style === style
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="explanation_style"
                      value={style}
                      checked={persona.explanation_style === style}
                      onChange={(e) =>
                        setPersona({
                          ...persona,
                          explanation_style: e.target.value as any,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="font-semibold capitalize">{style}</span>
                    <p className="text-xs text-gray-600 mt-1">
                      {style === 'detallado' && 'Explicaciones exhaustivas con ejemplos'}
                      {style === 'conciso' && 'Explicaciones breves y directas'}
                      {style === 'socrático' && 'Preguntas para que descubra por sí mismo'}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Nivel de Dificultad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Nivel de Dificultad
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['basico', 'intermedio', 'avanzado'] as const).map((level) => (
                  <label
                    key={level}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      persona.difficulty_level === level
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty_level"
                      value={level}
                      checked={persona.difficulty_level === level}
                      onChange={(e) =>
                        setPersona({
                          ...persona,
                          difficulty_level: e.target.value as any,
                        })
                      }
                      className="mr-2"
                    />
                    <span className="font-semibold capitalize">{level}</span>
                    <p className="text-xs text-gray-600 mt-1">
                      {level === 'basico' && 'Principiantes, conceptos fundacionales'}
                      {level === 'intermedio' && 'Conocimiento previo, aplicaciones'}
                      {level === 'avanzado' && 'Expertos, tópicos complejos'}
                    </p>
                  </label>
                ))}
              </div>
            </div>

            {/* Lenguaje */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={persona.language}
                onChange={(e) =>
                  setPersona({ ...persona, language: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="fr">Français</option>
              </select>
            </div>

            {/* Mensaje de Estado */}
            {message && (
              <div className={`p-4 rounded-lg text-sm font-semibold ${
                message.includes('✅') ? 'bg-green-100 text-green-800' :
                message.includes('❌') ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {message}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving || !selectedCourse}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition"
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>

          {/* Nota Informativa */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 Sobre la Persona Pedagógica:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Afecta cómo el Agente Docente enseña a los alumnos</li>
              <li>Se aplica a todas las respuestas del curso</li>
              <li>Se usa en el TEACHER_PROMPT dinámicamente</li>
              <li>Puedes cambiarla en cualquier momento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
