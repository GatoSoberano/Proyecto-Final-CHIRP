'use client';
import { useEffect, useState } from 'react';
import { api, isAuthed } from '../lib/api';
import Composer from '../components/Composer';
import ChirpCard from '../components/ChirpCard';

export default function Feed() {
  const [chirps, setChirps] = useState<any[]>([]);
  const [authed, setAuthed] = useState(false);

  async function load() {
    try {
      const data = authed ? await api.timeline() : await api.explore();
      setChirps(data);
    } catch { setChirps(await api.explore()); }
  }

  useEffect(() => { setAuthed(isAuthed()); }, []);
  useEffect(() => { load(); }, [authed]);

  return (
    <div>
      {authed ? <Composer onPosted={load} /> : (
        <div className="card meta">Inicia sesión para publicar. Mostrando <b>Explorar</b> (ordenado por engagement).</div>
      )}
      {chirps.map((c) => <ChirpCard key={c.id} chirp={c} onChange={load} />)}
      {chirps.length === 0 && <p className="meta">No hay chirps todavía.</p>}
    </div>
  );
}
