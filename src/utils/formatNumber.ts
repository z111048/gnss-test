export function fmt(value: number, decimals = 3): string {
  return value.toFixed(decimals);
}

export function fmtSci(value: number, decimals = 3): string {
  return value.toExponential(decimals);
}

export function fmtKm(meters: number): string {
  return (meters / 1000).toFixed(1) + ' km';
}

export function fmtNs(seconds: number): string {
  return (seconds * 1e9).toFixed(1) + ' ns';
}
