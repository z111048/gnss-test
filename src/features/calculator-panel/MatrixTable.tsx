import { fmt } from '../../utils/formatNumber';

interface MatrixTableProps {
  matrix: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  title?: string;
  highlightRow?: number;
}

export function MatrixTable({
  matrix,
  rowLabels,
  colLabels,
  title,
  highlightRow,
}: MatrixTableProps) {
  return (
    <div className="matrix-table">
      {title && <div className="matrix-title">{title}</div>}
      <table>
        {colLabels && (
          <thead>
            <tr>
              {rowLabels && <th />}
              {colLabels.map((label, i) => (
                <th key={i}>{label}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {matrix.map((row, i) => (
            <tr
              key={i}
              className={highlightRow === i ? 'highlight' : ''}
            >
              {rowLabels && <td className="row-label">{rowLabels[i]}</td>}
              {row.map((val, j) => (
                <td key={j}>{fmt(val, 4)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
