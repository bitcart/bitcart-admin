<template>
  <v-card class="bc-panel" height="100%">
    <div class="bc-panel__head">
      <div>
        <div class="bc-panel__title">Revenue</div>
        <div class="text-caption text-muted">
          Paid invoices in {{ currency }} · last {{ days }} days
        </div>
      </div>
      <div class="text-right">
        <div class="bc-panel__big kpi-value">{{ totalText }}</div>
        <div class="text-caption text-muted">{{ totalCount }} invoices</div>
      </div>
    </div>
    <v-skeleton-loader v-if="loading" type="image" height="390" class="px-4" />
    <client-only v-else>
      <ApexChart
        :key="chartKey"
        type="area"
        height="390"
        :options="options"
        :series="series"
      />
    </client-only>
  </v-card>
</template>

<script>
import { baseChartOptions, PURPLE, CYAN } from "@/utils/chartTheme"
import { formatMoney, formatCompact } from "@/utils/dashboard"

export default {
  props: {
    buckets: { type: Array, default: () => [] },
    currency: { type: String, default: "USD" },
    days: { type: Number, default: 30 },
    loading: { type: Boolean, default: false },
  },
  computed: {
    dark() {
      return this.$vuetify.theme.dark
    },
    chartKey() {
      return `${this.dark}-${this.currency}`
    },
    total() {
      return this.buckets.reduce((acc, b) => acc + b.revenue, 0)
    },
    totalCount() {
      return this.buckets.reduce((acc, b) => acc + b.count, 0)
    },
    totalText() {
      return formatMoney(this.total, this.currency)
    },
    series() {
      return [
        {
          name: `Revenue (${this.currency})`,
          type: "area",
          data: this.buckets.map((b) => [b.date, +b.revenue.toFixed(2)]),
        },
        {
          name: "Invoices",
          type: "line",
          data: this.buckets.map((b) => [b.date, b.count]),
        },
      ]
    },
    options() {
      const currency = this.currency
      return baseChartOptions(this.dark, {
        chart: { type: "area", stacked: false },
        colors: [PURPLE, CYAN],
        stroke: { width: [2.5, 2], dashArray: [0, 5] },
        fill: {
          type: ["gradient", "solid"],
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.02,
            stops: [0, 95],
          },
        },
        legend: { position: "top", horizontalAlign: "left", offsetY: 4 },
        markers: { size: 0, hover: { size: 5 } },
        xaxis: {
          type: "datetime",
          labels: { datetimeUTC: false, format: "dd MMM" },
          tooltip: { enabled: false },
        },
        yaxis: [
          {
            labels: { formatter: (v) => formatCompact(v || 0) },
          },
          {
            opposite: true,
            labels: { formatter: (v) => Math.round(v || 0) },
          },
        ],
        tooltip: {
          shared: true,
          x: { format: "ddd, dd MMM yyyy" },
          y: [
            { formatter: (v) => formatMoney(v || 0, currency) },
            { formatter: (v) => `${v}` },
          ],
        },
      })
    },
  },
}
</script>
