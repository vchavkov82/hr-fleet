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

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number, currency = 'BGN'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
