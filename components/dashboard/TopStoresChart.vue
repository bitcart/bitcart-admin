<template>
  <v-card class="bc-panel" height="100%">
    <div class="bc-panel__head">
      <div>
        <div class="bc-panel__title">Top stores</div>
        <div class="text-caption text-muted">
          By paid revenue in {{ currency }}
        </div>
      </div>
      <v-btn text small to="/stores" class="text-muted">
        All stores <v-icon small right>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
    <v-skeleton-loader v-if="loading" type="list-item@4" class="px-2 pb-4" />
    <div v-else-if="rows.length" class="px-5 pb-5">
      <div v-for="(row, i) in rows" :key="row.storeId" class="bc-bar">
        <div class="d-flex align-center mb-1">
          <span class="bc-bar__rank">{{ i + 1 }}</span>
          <span class="bc-bar__name text-truncate">{{ row.name }}</span>
          <v-spacer />
          <span class="kpi-value font-weight-semibold">{{
            formatMoney(row.revenue, currency)
          }}</span>
          <span class="text-caption text-muted ml-2 kpi-value"
            >{{ row.count }} inv.</span
          >
        </div>
        <div class="bc-bar__track">
          <div
            class="bc-bar__fill"
            :style="{ width: `${Math.max(2, (row.revenue / max) * 100)}%` }"
          />
        </div>
      </div>
    </div>
    <div v-else class="bc-empty">
      <v-icon size="40" class="text-muted">mdi-store-outline</v-icon>
      <div class="text-muted mt-2">No store activity yet</div>
    </div>
  </v-card>
</template>

<script>
import { formatMoney } from "@/utils/dashboard"

export default {
  props: {
    stores: { type: Array, default: () => [] },
    storeNames: { type: Object, default: () => ({}) },
    currency: { type: String, default: "USD" },
    loading: { type: Boolean, default: false },
  },
  computed: {
    rows() {
      return this.stores.map((s) => ({
        ...s,
        name:
          this.storeNames[s.storeId] ||
          (s.storeId === "none" ? "No store" : s.storeId),
      }))
    },
    max() {
      return Math.max(1, ...this.rows.map((r) => r.revenue))
    },
  },
  methods: { formatMoney },
}
</script>

<style>
.bc-bar {
  margin-bottom: 16px;
}
.bc-bar:last-child {
  margin-bottom: 0;
}
.bc-bar__rank {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--bc-surface-2);
  color: var(--bc-muted);
  margin-right: 10px;
  flex: 0 0 auto;
}
.bc-bar__name {
  font-weight: 500;
  font-size: 0.9rem;
  max-width: 50%;
}
.bc-bar__track {
  height: 6px;
  border-radius: 6px;
  background: var(--bc-surface-2);
  overflow: hidden;
}
.bc-bar__fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, #8f0cf4, #b98cf8);
  transition: width 0.6s ease;
}
</style>
