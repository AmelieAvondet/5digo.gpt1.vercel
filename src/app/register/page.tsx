// Archivo: app/register/page.tsx
"use client";

import { registerUser } from '@/app/action';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, AlertCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'alumno' | 'profesor'>('alumno');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.set('email', email);
            formData.set('password', password);
            formData.set('role', role);

            const result = await registerUser(formData);

            if (result.error) {
                setError(result.error);
                setLoading(false);
                return;
            }

            // Registro exitoso - mostrar mensaje de verificación
            if (result.emailConfirmationRequired) {
                setRegistrationSuccess(true);
                setLoading(false);
            } else {
                // Si no requiere confirmación (modo legacy), redirigir según rol
                if (role === 'profesor') {
                    router.push('/admin/courses');
                } else {
                    router.push('/courses');
                }
            }
        } catch (err: any) {
            setError('Error al conectarse al servidor');
            setLoading(false);
        }
    };

    // Si el registro fue exitoso, mostrar mensaje de confirmación
    if (registrationSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
                <div className="w-full max-w-md">
                    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
                        <CardHeader className="space-y-2 pb-4">
                            <div className="flex items-center justify-center mb-2">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-emerald-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl text-center">¡Revisa tu correo!</CardTitle>
                            <CardDescription className="text-center">Te hemos enviado un email de verificación</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-emerald-800 text-sm text-center mb-2">
                                    Hemos enviado un enlace de verificación a:
                                </p>
                                <p className="text-emerald-900 font-semibold text-center">
                                    {email}
                                </p>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p>Por favor, sigue estos pasos:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2">
                                    <li>Abre tu correo electrónico</li>
                                    <li>Busca el email de verificación</li>
                                    <li>Haz clic en el enlace de confirmación</li>
                                    <li>Vuelve aquí para iniciar sesión</li>
                                </ol>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500 text-center mb-3">
                                    ¿No recibiste el email? Revisa tu carpeta de spam.
                                </p>
                                <Link href="/login">
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                                        Ir a iniciar sesión
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
                    <CardHeader className="space-y-2 pb-4">
                        <div className="flex items-center justify-center mb-2">
                        </div>
                        <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
                        <CardDescription className="text-center">Únete a nuestra plataforma educativa</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="nombre@ejemplo.com"
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Selecciona tu rol
                                </label>
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setRole('alumno')}
                                        className={`w-full p-3 border-2 rounded-lg transition-all ${
                                            role === 'alumno'
                                                ? 'border-emerald-600 bg-emerald-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <div className="text-left">
                                                <p className="font-semibold text-sm">Alumno</p>
                                                <p className="text-xs text-gray-500">Aprende con la IA</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('profesor')}
                                        className={`w-full p-3 border-2 rounded-lg transition-all ${
                                            role === 'profesor'
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <div className="text-left">
                                                <p className="font-semibold text-sm">Profesor</p>
                                                <p className="text-xs text-gray-500">Crea cursos</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 h-10"
                            >
                                {loading ? 'Registrando...' : 'Crear Cuenta'}
                            </Button>
                        </form>

                        <div className="mt-6 border-t pt-6 text-center">
                            <p className="text-gray-600 text-sm">
                                ¿Ya tienes cuenta?{' '}
                                <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}