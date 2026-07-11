'use client';
import { useState } from 'react';
import { api } from '../../lib/api';
import ToxicityText from '../../components/ToxicityText';

export default function AnalyzePage() {
  const [text, setText] = useState('Eres un idiota, callate y no vuelvas');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try { setData(await api.moderate(text)); }
    catch (e: any) { alert(e.message || 'Error al analizar'); }
    finally { setLoading(false); }
  }
  const toxic = data?.is_toxic;

  return (
    <div>
      <div className="card">
        <h2>Analizador de toxicidad 🛡️</h2>
        <p className="meta">El modelo clasifica el texto y resalta las palabras tóxicas.</p>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={analyze} disabled={loading}>{loading ? 'Analizando...' : 'Analizar'}</button>
      </div>
      {data && (
        <div className="card">
          <div className="row">
            <span className="badge" style={{
              background: toxic ? 'rgba(224,36,94,.15)' : 'rgba(0,186,124,.15)',
              color: toxic ? '#e0245e' : '#00ba7c', fontSize: 16 }}>
              {toxic ? '⚠️ TÓXICO' : '✓ LIMPIO'} · {Math.round(data.toxicity_score)}%
            </span>
            <span className="meta">modelo: {data.model_version}</span>
          </div>
          <div style={{ height: 10, background: '#38444d', borderRadius: 6, margin: '12px 0' }}>
            <div style={{ width: `${data.toxicity_score}%`, height: '100%', borderRadius: 6,
              background: 'linear-gradient(90deg,#f5d90a,#e0245e)' }} />
          </div>
          <p style={{ fontSize: 20, lineHeight: 1.8 }}><ToxicityText tokens={data.tokens} /></p>
        </div>
      )}
    </div>
  );
}