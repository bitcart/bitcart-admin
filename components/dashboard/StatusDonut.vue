<template>
  <v-card class="bc-panel" height="100%">
    <div class="bc-panel__head">
      <div>
        <div class="bc-panel__title">Invoice status</div>
        <div class="text-caption text-muted">Last {{ days }} days</div>
      </div>
    </div>
    <v-skeleton-loader v-if="loading" type="image" height="300" class="px-4" />
    <template v-else-if="total">
      <client-only>
        <ApexChart
          :key="String(dark)"
          type="donut"
          height="230"
          :options="options"
          :series="breakdown.map((x) => x.count)"
        />
      </client-only>
      <div class="bc-legend px-5 pb-5">
        <div
          v-for="item in breakdown"
          :key="item.status"
          class="bc-legend__row"
        >
          <span class="bc-legend__dot" :style="{ background: item.color }" />
          <span class="bc-legend__label">{{ item.label }}</span>
          <v-spacer />
          <span class="kpi-value font-weight-semibold">{{ item.count }}</span>
          <span class="bc-legend__pct text-muted kpi-value">
            {{ ((item.count / total) * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
    </template>
    <div v-else class="bc-empty">
      <v-icon size="40" class="text-muted">mdi-chart-donut</v-icon>
      <div class="text-muted mt-2">No invoices in this period</div>
    </div>
  </v-card>
</template>

<script>
import { baseChartOptions } from "@/utils/chartTheme"

export default {
  props: {
    breakdown: { type: Array, default: () => [] },
    days: { type: Number, default: 30 },
    loading: { type: Boolean, default: false },
  },
  computed: {
    dark() {
      return this.$vuetify.theme.dark
    },
    total() {
      return this.breakdown.reduce((acc, x) => acc + x.count, 0)
    },
    options() {
      const total = this.total
      return baseChartOptions(this.dark, {
        labels: this.breakdown.map((x) => x.label),
        colors: this.breakdown.map((x) => x.color),
        legend: { show: false },
        stroke: { width: 3, colors: [this.dark ? "#12151C" : "#FFFFFF"] },
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: "74%",
              labels: {
                show: true,
                name: { offsetY: 20, fontSize: "12px" },
                value: {
                  offsetY: -14,
                  fontSize: "26px",
                  fontWeight: 700,
                  color: this.dark ? "#fff" : "#0f172a",
                },
                total: {
                  show: true,
                  label: "Invoices",
                  fontSize: "12px",
                  formatter: () => total,
                },
              },
            },
          },
        },
      })
    },
  },
}
</script>
