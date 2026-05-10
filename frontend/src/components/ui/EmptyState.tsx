interface Props {
  emoji: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  bordered?: boolean;
}

export default function EmptyState({ emoji, title, description, action, bordered = true }: Props) {
  return (
    <div style={{
      background: 'white', borderRadius: 20,
      border: bordered ? '1px solid #e2e8f0' : 'none',
      boxShadow: bordered ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      padding: '56px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>{title}</p>
      {description && <p style={{ color: '#cbd5e1', fontSize: 13, marginTop: 8 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
