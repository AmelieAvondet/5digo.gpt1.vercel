// app/admin/temarios/page.tsx (Vista del Profesor)

import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase'; // Asegúrate de importar el cliente admin
import AdminLayout from '@/components/AdminLayout'; // Crearemos esto para la navegación

// Marcar como página dinámica (no estática)
export const dynamic = 'force-dynamic';

// Server Action para obtener y validar el rol
async function getTemariosAndVerifyAuth() {
    // Verificar que las variables estén configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    // ⚠️ REEMPLAZAR con lógica de extracción de JWT y user ID real
    const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001";

    // 1. Verificar Rol (Simulación rápida para MVP)
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', DUMMY_USER_ID)
        .single();
    
    if (userError || userData?.role !== 'profesor') {
        redirect('/chat?error=NoAutorizado');
    }

    // 2. Obtener la lista de temarios
    const { data: topicsData, error: topicsError } = await supabaseAdmin
        .from('topics')
        .select('*');

    if (topicsError) {
        throw new Error('Error al cargar temarios');
    }
    
    return topicsData;
}

export default async function AdminTemariosPage() {
    const temarios = await getTemariosAndVerifyAuth();

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-6">Gestión de Temarios</h1>
            <button className="bg-blue-500 text-white p-2 rounded mb-4">
                + Crear Nuevo Temario
            </button>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200">
                    {temarios.map((tema) => (
                        <li key={tema.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                            <p className="text-lg font-medium">{tema.name}</p>
                            <span className="text-sm text-gray-500">ID: {tema.id}</span>
                            <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Aquí faltarían componentes para editar el contenido largo (content) del temario */}
        </AdminLayout>
    );
}