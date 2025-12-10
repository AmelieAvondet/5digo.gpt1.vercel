// src/components/AdminHeader.tsx
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/action';

interface AdminHeaderProps {
  title: string;
  backLink?: string;
  backText?: string;
  rightAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
}

export default function AdminHeader({
  title,
  backLink,
  backText = '← Volver',
  rightAction,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  const getButtonStyle = (variant?: string) => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Back button */}
        {backLink && (
          <Link href={backLink} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            {backText}
          </Link>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

          <div className="flex gap-3 items-center">
            {rightAction && (
              rightAction.href ? (
                <Link
                  href={rightAction.href}
                  className={`${getButtonStyle(
                    rightAction.variant
                  )} px-4 py-2 rounded-lg transition font-medium`}
                >
                  {rightAction.label}
                </Link>
              ) : (
                <button
                  onClick={rightAction.onClick}
                  className={`${getButtonStyle(
                    rightAction.variant
                  )} px-4 py-2 rounded-lg transition font-medium`}
                >
                  {rightAction.label}
                </button>
              )
            )}

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
