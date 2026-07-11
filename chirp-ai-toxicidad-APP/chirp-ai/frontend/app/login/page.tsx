'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '../../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    try {
      const { accessToken } = await api.login({ email, password });
      setToken(accessToken);
      router.push('/');
    } catch (err: any) { alert(err.message); }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Iniciar sesión</h2>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
      <p className="meta">¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </form>
  );
}
