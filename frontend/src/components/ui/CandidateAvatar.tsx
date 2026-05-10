export const AVATAR_COLORS = ['#7c3aed', '#0891b2', '#15803d', '#b45309', '#be123c', '#0369a1'];

interface Props {
  photo?: string;
  name: string;
  size?: number;
  colorIndex?: number;
}

export default function CandidateAvatar({ photo, name, size = 44, colorIndex = 0 }: Props) {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const fontSize = Math.round(size * 0.4);

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${color}15`, border: `2px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 700, fontSize,
    }}>
      {initial}
    </div>
  );
}
