'use client';
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import ToxicityText from './ToxicityText';

export default function Composer({ onPosted }: { onPosted?: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mod, setMod] = useState<any>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!text.trim()) { setMod(null); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { setMod(await api.moderate(text)); } catch {}
    }, 400);
    return () => timer.current && clearTimeout(timer.current);
  }, [text]);

  async function post() {
    if (!text.trim()) return;
    setLoading(true);
    try { await api.createChirp({ text }); setText(''); setMod(null); onPosted?.(); }
    catch (e: any) { alert(e.message || 'Inicia sesión para publicar'); }
    finally { setLoading(false); }
  }
  const toxic = mod?.is_toxic;

  return (
    <div className="card">
      <textarea rows={3} maxLength={280} placeholder="¿Qué está pasando?"
        value={text} onChange={(e) => setText(e.target.value)} />
      {mod && (
        <div style={{ margin: '6px 0', fontSize: 14 }}>
          <span className="badge" style={{
            background: toxic ? 'rgba(224,36,94,.15)' : 'rgba(0,186,124,.15)',
            color: toxic ? '#e0245e' : '#00ba7c' }}>
            {toxic ? '⚠️ Posible contenido tóxico' : '✓ Se ve bien'} · {Math.round(mod.toxicity_score)}%
          </span>
          {mod.flagged_words?.length > 0 && (
            <div style={{ marginTop: 6 }}><ToxicityText tokens={mod.tokens} /></div>
          )}
        </div>
      )}
      <div className="row">
        <span className="meta">{text.length}/280</span>
        <button onClick={post} disabled={loading}>{loading ? '...' : 'Chirp'}</button>
      </div>
    </div>
  );
}