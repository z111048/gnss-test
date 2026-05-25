import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaBlockProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function FormulaBlock({
  formula,
  displayMode = true,
  className = '',
}: FormulaBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(formula, ref.current, {
        displayMode,
        throwOnError: false,
      });
    }
  }, [formula, displayMode]);

  return <div ref={ref} className={className} />;
}
