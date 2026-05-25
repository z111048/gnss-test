interface ValueInspectorProps {
  items: { label: string; value: string | number; unit?: string; color?: string }[];
}

export function ValueInspector({ items }: ValueInspectorProps) {
  return (
    <div className="value-inspector">
      {items.map((item, i) => (
        <div key={i} className="value-row">
          <span className="value-label">{item.label}</span>
          <span
            className="value-value"
            style={item.color ? { color: item.color } : undefined}
          >
            {typeof item.value === 'number' ? item.value.toFixed(3) : item.value}
            {item.unit && <span className="value-unit"> {item.unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
