'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '../../lib/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    try {
      const { accessToken } = await api.register(form);
      setToken(accessToken);
      router.push('/');
    } catch (err: any) { alert(err.message); }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Crear cuenta</h2>
      <input placeholder="usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Registrarme</button>
    </form>
  );
}
