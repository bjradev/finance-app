export function formatNumber(
  value: number,
  minDigits: number = 2,
  maxDigits: number = 2
): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(value);
}
