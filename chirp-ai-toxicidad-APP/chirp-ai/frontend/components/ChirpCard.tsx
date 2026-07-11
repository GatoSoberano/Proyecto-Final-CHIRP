'use client';
import { api } from '../lib/api';
import { useState } from 'react';
import ToxicityText from './ToxicityText';

export default function ChirpCard({ chirp, onChange }: { chirp: any; onChange?: () => void }) {
  const [likes, setLikes] = useState(chirp.likesCount);
  const [liked, setLiked] = useState(false);

  async function toggleLike() {
    try {
      if (liked) { await api.unlike(chirp.id); setLikes((n: number) => n - 1); }
      else { await api.like(chirp.id); setLikes((n: number) => n + 1); }
      setLiked(!liked);
    } catch (e) { alert('Inicia sesión para dar like'); }
  }

  const score = Math.round(chirp.toxicityScore ?? 0);
  const flagged = chirp.flaggedWords ?? [];
  const tokens = (chirp.text || '').split(/\s+/).map((w: string) => {
    const key = w.replace(/[^\wáéíóúñü#@]/gi, '').toLowerCase();
    const hit = flagged.find((f: any) => f.text.toLowerCase() === key);
    return { text: w, weight: hit ? hit.weight : 0 };
  });

  return (
    <div className="card">
      <div className="row">
        <strong>@{chirp.author?.username ?? 'usuario'}</strong>
        <span className="badge" style={{
          background: chirp.isFlagged ? 'rgba(224,36,94,.15)' : 'rgba(0,186,124,.15)',
          color: chirp.isFlagged ? '#e0245e' : '#00ba7c' }}>
          {chirp.isFlagged ? `⚠️ Tóxico ${score}%` : `✓ OK ${score}%`}
        </span>
      </div>
      <p style={{ fontSize: 18 }}>
        {flagged.length > 0 ? <ToxicityText tokens={tokens} /> : chirp.text}
      </p>
      <div className="row">
        <button className="ghost" onClick={toggleLike}>♥ {likes}</button>
        <span className="meta">{new Date(chirp.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );
}