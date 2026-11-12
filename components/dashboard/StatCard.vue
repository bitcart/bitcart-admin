<template>
  <v-card class="bc-stat bc-hover" :to="link" height="100%">
    <div class="bc-stat__top">
      <div class="bc-stat__icon" :style="iconStyle">
        <v-icon :color="color" size="22">{{ icon }}</v-icon>
      </div>
      <v-chip
        v-if="delta !== undefined && delta !== null && !loading"
        x-small
        label
        class="bc-stat__delta"
        :class="deltaClass"
      >
        <v-icon x-small left>{{
          delta >= 0 ? "mdi-trending-up" : "mdi-trending-down"
        }}</v-icon>
        {{ Math.abs(delta).toFixed(1) }}%
      </v-chip>
    </div>
    <div class="bc-stat__label">{{ label }}</div>
    <v-skeleton-loader v-if="loading" type="heading" class="mt-2" />
    <div v-else class="bc-stat__value kpi-value">
      {{ value }}
    </div>
    <div v-if="caption && !loading" class="bc-stat__caption text-muted">
      {{ caption }}
    </div>
    <slot />
    <client-only>
      <div v-if="sparkline && sparkline.length > 1" class="bc-stat__spark">
        <ApexChart
          type="area"
          height="56"
          :options="sparkOptions"
          :series="[{ name: label, data: sparkline }]"
        />
      </div>
    </client-only>
  </v-card>
</template>

<script>
export default {
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], default: "" },
    caption: { type: String, default: "" },
    icon: { type: String, default: "mdi-chart-box-outline" },
    color: { type: String, default: "#9E60F4" },
    delta: { type: Number, default: undefined },
    link: { type: String, default: undefined },
    sparkline: { type: Array, default: null },
    loading: { type: Boolean, default: false },
  },
  computed: {
    iconStyle() {
      return { background: `${this.color}1f` }
    },
    deltaClass() {
      return this.delta >= 0 ? "bc-delta--up" : "bc-delta--down"
    },
    sparkOptions() {
      return {
        chart: {
          sparkline: { enabled: true },
          background: "transparent",
          animations: { enabled: false },
        },
        colors: [this.color],
        stroke: { curve: "smooth", width: 2 },
        fill: {
          type: "gradient",
          gradient: { opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] },
        },
        tooltip: { enabled: false },
      }
    },
  },
}
</script>

<style>
.bc-stat {
  padding: 20px 20px 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bc-stat__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.bc-stat__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bc-stat__label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--bc-muted);
}
.bc-stat__value {
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.25;
  margin-top: 4px;
  word-break: break-word;
}
.bc-stat__caption {
  font-size: 0.75rem;
  margin-top: 2px;
  padding-bottom: 16px;
}
.bc-stat__spark {
  margin: auto -20px 0;
}
.v-application .bc-delta--up {
  background: rgba(34, 197, 94, 0.14) !important;
  color: #22c55e !important;
}
.v-application .bc-delta--down {
  background: rgba(239, 68, 68, 0.14) !important;
  color: #ef4444 !important;
}
.bc-delta--up .v-icon,
.bc-delta--down .v-icon {
  color: inherit !important;
}
</style>
