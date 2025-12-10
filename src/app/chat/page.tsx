// Archivo: app/chat/page.tsx (Componente de Interfaz de Chat)

"use client";

import React, { useState, useEffect } from 'react';
import { chatWithAI, initializeChatSession } from './action';
import { loadAvailableTopics } from './loader';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/action';
import MarkdownMessage from '@/components/MarkdownMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, LogOut, Menu, X, BookOpen, MessageCircle } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };
type Course = { id: string; title: string; type: string };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
            <Send className="w-4 h-4" />
        </Button>
    );
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [courseLoading, setCourseLoading] = useState(false);
    const [chatInitialized, setChatInitialized] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();

    // Cargar cursos disponibles al montar
    useEffect(() => {
        loadCourses();
    }, []);

    // Inicializar chat cuando cambia el curso
    useEffect(() => {
        if (selectedCourse && !chatInitialized) {
            initializeChat();
        }
    }, [selectedCourse, chatInitialized]);

    const loadCourses = async () => {
        const result = await loadAvailableTopics();
        if (result.topics && result.topics.length > 0) {
            setCourses(result.topics);
            setSelectedCourse(result.topics[0].id);
        }
        setLoading(false);
    };

    const initializeChat = async () => {
        setCourseLoading(true);
        try {
            const result = await initializeChatSession(selectedCourse);
            if (result.error) {
                console.error('Error initializing chat:', result.error);
                alert(result.error);
            } else {
                // Crear mensaje inicial del tutor
                const assistantMessage: Message = {
                    role: 'assistant',
                    content: result.response,
                };
                setMessages([assistantMessage]);
                setChatInitialized(true);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setCourseLoading(false);
        }
    };

    const handleChangeCourse = (courseId: string) => {
        setSelectedCourse(courseId);
        setMessages([]);
        setChatInitialized(false);
    };

    const handleSubmit = async (formData: FormData) => {
        const newMessage = formData.get("message") as string;
        if (!newMessage.trim()) return;

        const userMessage: Message = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMessage]);

        const form = document.querySelector('form') as HTMLFormElement;
        if (form) form.reset();

        try {
            const result = await chatWithAI(newMessage, selectedCourse);

            if (result.error) {
                alert(result.error);
                setMessages(prev => prev.slice(0, -1));
                return;
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: result.response,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar mensaje');
            setMessages(prev => prev.slice(0, -1));
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        router.push('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {selectedCourse && courses.find(c => c.id === selectedCourse)?.title || 'Tutor Inteligente'}
                        </h1>
                        <p className="text-xs text-gray-500">Aprende con inteligencia artificial</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Selector de cursos en dropdown */}
                    <div className="hidden sm:block">
                        <select
                            value={selectedCourse}
                            onChange={(e) => handleChangeCourse(e.target.value)}
                            disabled={courseLoading || loading}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                            <option value="">Selecciona un curso...</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Badge variant="secondary" className="hidden sm:flex">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        {messages.length}
                    </Badge>

                    <Button
                        onClick={handleLogout}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Chat Area - Pantalla completa */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 w-full">
                {courseLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Inicializando chat...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-gray-600 font-medium">Comienza a aprender</p>
                            <p className="text-gray-500 text-sm mt-2">
                                {selectedCourse 
                                    ? 'Haz tu primera pregunta al tutor IA' 
                                    : 'Selecciona un curso para empezar'}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-3 mt-1">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            )}
                            <div
                                className={`max-w-3xl px-5 py-3 rounded-lg ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none shadow-sm'
                                }`}
                            >
                                <MarkdownMessage content={msg.content} isUser={msg.role === 'user'} />
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 ml-3 mt-1">
                                    <span className="text-xs font-semibold text-gray-700">TÚ</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div className="h-4"></div>
            </div>

            {/* Input Form - Al final */}
            {selectedCourse && !courseLoading && (
                <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-lg">
                    <form action={handleSubmit} className="w-full px-4 flex gap-3">
                        <Input
                            type="text"
                            name="message"
                            placeholder="Escribe tu pregunta al tutor IA..."
                            disabled={courseLoading}
                            className="flex-1"
                            autoFocus
                        />
                        <SubmitButton />
                    </form>
                </div>
            )}

            {/* Selector de cursos móvil */}
            {selectedCourse === '' && loading === false && (
                <div className="bg-white border-t border-gray-200 p-4 max-h-48 overflow-y-auto sm:hidden">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Selecciona un curso:</h3>
                    <div className="space-y-2">
                        {courses.map((course) => (
                            <button
                                key={course.id}
                                onClick={() => handleChangeCourse(course.id)}
                                className="w-full text-left p-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                            >
                                {course.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}