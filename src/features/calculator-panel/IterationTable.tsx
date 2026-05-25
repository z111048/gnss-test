import type { IterationStep } from '../gps-calculation/types';
import { fmt } from '../../utils/formatNumber';

interface IterationTableProps {
  steps: IterationStep[];
  highlightRow?: number;
  onSelectRow?: (i: number) => void;
}

export function IterationTable({
  steps,
  highlightRow,
  onSelectRow,
}: IterationTableProps) {
  if (steps.length === 0) {
    return (
      <div className="iteration-empty">
        點擊「執行最小平方法」來開始迭代計算
      </div>
    );
  }

  return (
    <div className="iteration-table-wrapper">
      <table className="iteration-table">
        <thead>
          <tr>
            <th>迭代</th>
            <th>X (km)</th>
            <th>Y (km)</th>
            <th>Z (km)</th>
            <th>B (m)</th>
            <th>殘差 (m)</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => (
            <tr
              key={i}
              className={highlightRow === i ? 'active' : ''}
              onClick={() => onSelectRow?.(i)}
              style={{ cursor: onSelectRow ? 'pointer' : undefined }}
            >
              <td>{step.iteration}</td>
              <td>{fmt(step.x, 1)}</td>
              <td>{fmt(step.y, 1)}</td>
              <td>{fmt(step.z, 1)}</td>
              <td>{fmt(step.B, 2)}</td>
              <td
                style={{
                  color:
                    step.residualNorm < 10
                      ? '#4ade80'
                      : step.residualNorm < 1000
                      ? '#fbbf24'
                      : '#f87171',
                }}
              >
                {fmt(step.residualNorm, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
