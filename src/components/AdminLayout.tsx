// components/AdminLayout.tsx
import React from 'react';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar de Navegación Admin */}
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
                <nav>
                    <a href="/admin/temarios" className="block p-2 rounded hover:bg-gray-700">Gestión Temarios</a>
                    <a href="/admin/usuarios" className="block p-2 rounded hover:bg-gray-700">Gestión Usuarios</a>
                    {/* ... otras vistas ... */}
                </nav>
            </aside>
            
            {/* Contenido Principal */}
            <main className="flex-1 overflow-y-auto p-10">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
