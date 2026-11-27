<template>
  <v-card class="bc-panel" height="100%">
    <div class="bc-panel__head">
      <div>
        <div class="bc-panel__title">Recent invoices</div>
        <div class="text-caption text-muted">Latest activity</div>
      </div>
      <v-btn text small to="/invoices" class="text-muted">
        View all <v-icon small right>mdi-arrow-right</v-icon>
      </v-btn>
    </div>
    <v-skeleton-loader
      v-if="loading"
      type="list-item-avatar-two-line@4"
      class="px-2 pb-4"
    />
    <v-list v-else-if="invoices.length" class="pt-0 px-2 pb-3 transparent">
      <v-list-item
        v-for="invoice in invoices"
        :key="invoice.id"
        class="bc-recent"
        :to="`/i/${invoice.id}`"
        target="_blank"
      >
        <v-list-item-avatar
          size="38"
          class="bc-recent__avatar"
          :style="avatarStyle(invoice)"
        >
          <v-icon small :color="meta(invoice).color">{{
            icon(invoice)
          }}</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="font-weight-semibold kpi-value">
            {{ formatMoney(amountOf(invoice), invoice.currency) }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-truncate">
            {{ invoice.order_id || invoice.buyer_email || invoice.id }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action class="align-end">
          <span
            class="bc-status"
            :style="{
              color: meta(invoice).color,
              background: `${meta(invoice).color}1f`,
            }"
            >{{ meta(invoice).label }}</span
          >
          <span class="text-caption text-muted mt-1">{{
            timeAgo(invoice.created)
          }}</span>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <div v-else class="bc-empty">
      <v-icon size="40" class="text-muted">receipt_long</v-icon>
      <div class="text-muted mt-2">No invoices yet</div>
      <v-btn small color="primary" class="mt-4" to="/invoices">
        Create invoice
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import {
  STATUS_META,
  amountOf,
  formatMoney,
  timeAgo,
  isPaid,
} from "@/utils/dashboard"

export default {
  props: {
    invoices: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  methods: {
    amountOf,
    formatMoney,
    timeAgo,
    meta(invoice) {
      return (
        STATUS_META[invoice.status] || {
          label: invoice.status,
          color: "#94A3B8",
        }
      )
    },
    icon(invoice) {
      if (isPaid(invoice)) return "mdi-check"
      if (invoice.status === "pending") return "mdi-clock-outline"
      if (invoice.status === "refunded") return "mdi-undo"
      return "mdi-close"
    },
    avatarStyle(invoice) {
      return { background: `${this.meta(invoice).color}1f` }
    },
  },
}
</script>

<style>
.bc-recent {
  border-radius: 10px;
}
.bc-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}
</style>
