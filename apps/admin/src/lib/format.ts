const bgnFormatter = new Intl.NumberFormat("bg-BG", {
  style: "currency",
  currency: "BGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format stotinki (integer cents) as Bulgarian leva currency string.
 * Example: 150000 -> "1 500,00 лв."
 */
export function formatBGN(stotinki: number): string {
  return bgnFormatter.format(stotinki / 100);
}
