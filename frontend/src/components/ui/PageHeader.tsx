interface Props {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  alignTop?: boolean;
}

export default function PageHeader({ title, subtitle, action, alignTop }: Props) {
  return (
    <div className="page-header" style={alignTop ? { alignItems: 'flex-start' } : undefined}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{title}</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>{subtitle}</p>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
