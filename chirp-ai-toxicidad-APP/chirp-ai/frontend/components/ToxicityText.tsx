'use client';
type Token = { text: string; weight: number };

function bg(weight: number) {
  if (weight <= 0) return 'transparent';
  const alpha = 0.25 + weight * 0.6;
  return `rgba(224, 36, 94, ${alpha})`;
}

export default function ToxicityText({ tokens, plain }: { tokens?: Token[]; plain?: string }) {
  if (!tokens || tokens.length === 0) return <span>{plain}</span>;
  return (
    <span>
      {tokens.map((t, i) => (
        <span key={i} style={{
          background: bg(t.weight), borderRadius: 4,
          padding: t.weight > 0 ? '1px 3px' : 0,
          fontWeight: t.weight > 0 ? 700 : 400,
        }}>
          {t.text}{' '}
        </span>
      ))}
    </span>
  );
}