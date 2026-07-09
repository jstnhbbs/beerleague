export const PAYMENT_METHODS = [
    'Venmo',
    'CashApp',
    'PayPal',
    'Zelle',
    'Apple Cash',
    'Cash',
    'Check',
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export function normalizePaymentMethod(value: unknown): PaymentMethod | null {
    const method = String(value ?? '').trim()
    return PAYMENT_METHODS.find((option) => option === method) ?? null
}
