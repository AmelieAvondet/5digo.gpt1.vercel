import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir automáticamente a login
  redirect('/login');
}
