export const PAID_STATUSES = ["paid", "confirmed", "complete"]

export const STATUS_META = {
  complete: { label: "Complete", color: "#22C55E" },
  confirmed: { label: "Confirmed", color: "#4ADE80" },
  paid: { label: "Paid", color: "#86EFAC" },
  pending: { label: "Pending", color: "#F59E0B" },
  expired: { label: "Expired", color: "#64748B" },
  invalid: { label: "Invalid", color: "#EF4444" },
  refunded: { label: "Refunded", color: "#6366F1" },
}

const DAY = 24 * 60 * 60 * 1000

export function isPaid(invoice) {
  return PAID_STATUSES.includes(invoice.status)
}

export function amountOf(invoice) {
  const value = parseFloat(invoice.price)
  return isNaN(value) ? 0 : value
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Splits invoices into the current period (last `days` days) and the period before it
export function splitPeriods(invoices, days, now = new Date()) {
  const currentStart = startOfDay(now).getTime() - (days - 1) * DAY
  const previousStart = currentStart - days * DAY
  const current = []
  const previous = []
  for (const invoice of invoices) {
    const created = new Date(invoice.created).getTime()
    if (created >= currentStart) current.push(invoice)
    else if (created >= previousStart) previous.push(invoice)
  }
  return { current, previous }
}

// Returns [{ date, revenue, count, paid }] for each of the last `days` days
export function bucketByDay(invoices, days, currency, now = new Date()) {
  const today = startOfDay(now).getTime()
  const buckets = []
  const index = {}
  for (let i = days - 1; i >= 0; i--) {
    const date = today - i * DAY
    index[date] = buckets.length
    buckets.push({ date, revenue: 0, count: 0, paid: 0 })
  }
  for (const invoice of invoices) {
    const key = startOfDay(invoice.created).getTime()
    if (!(key in index)) continue
    const bucket = buckets[index[key]]
    bucket.count++
    if (isPaid(invoice)) {
      bucket.paid++
      if (!currency || invoice.currency === currency)
        bucket.revenue += amountOf(invoice)
    }
  }
  return buckets
}

export function statusBreakdown(invoices) {
  const counts = {}
  for (const invoice of invoices) {
    counts[invoice.status] = (counts[invoice.status] || 0) + 1
  }
  return Object.keys(counts)
    .map((status) => ({
      status,
      label: STATUS_META[status]?.label || status,
      color: STATUS_META[status]?.color || "#94A3B8",
      count: counts[status],
    }))
    .sort((a, b) => b.count - a.count)
}

export function revenueByCurrency(invoices) {
  const totals = {}
  for (const invoice of invoices) {
    if (!isPaid(invoice)) continue
    const currency = (invoice.currency || "").toUpperCase()
    totals[currency] = (totals[currency] || 0) + amountOf(invoice)
  }
  return totals
}

export function pickPrimaryCurrency(invoices, fallback) {
  const counts = {}
  for (const invoice of invoices) {
    if (!isPaid(invoice) || !invoice.currency) continue
    counts[invoice.currency] = (counts[invoice.currency] || 0) + 1
  }
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  return sorted[0] || fallback || "USD"
}

export function groupByStore(invoices, currency, limit = 6) {
  const stores = {}
  for (const invoice of invoices) {
    const id = invoice.store_id || "none"
    if (!stores[id]) stores[id] = { storeId: id, revenue: 0, count: 0 }
    stores[id].count++
    if (isPaid(invoice) && invoice.currency === currency)
      stores[id].revenue += amountOf(invoice)
  }
  return Object.values(stores)
    .sort((a, b) => b.revenue - a.revenue || b.count - a.count)
    .slice(0, limit)
}

export function pctDelta(current, previous) {
  if (!previous) return current ? null : 0
  return ((current - previous) / previous) * 100
}

export function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value)
  } catch {
    // non-ISO currencies (e.g. BTC)
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 8 })} ${currency}`
  }
}

export function formatCompact(value) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function timeAgo(date, now = new Date()) {
  const seconds = Math.max(0, Math.round((now - new Date(date)) / 1000))
  if (seconds < 60) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}
