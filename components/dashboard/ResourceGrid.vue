<template>
  <v-card class="bc-panel" height="100%">
    <div class="bc-panel__head">
      <div>
        <div class="bc-panel__title">Your resources</div>
        <div class="text-caption text-muted">Everything set up so far</div>
      </div>
    </div>
    <div class="bc-resources px-4 pb-4">
      <nuxt-link
        v-for="item in items"
        :key="item.key"
        :to="item.link"
        class="bc-resource"
      >
        <v-icon size="20" class="bc-resource__icon">{{ item.icon }}</v-icon>
        <div class="bc-resource__value kpi-value">
          {{ $store.state.stats[item.key] || 0 }}
        </div>
        <div class="bc-resource__label">{{ item.label }}</div>
      </nuxt-link>
    </div>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { key: "stores", label: "Stores", icon: "mdi-store", link: "/stores" },
        {
          key: "wallets",
          label: "Wallets",
          icon: "mdi-wallet",
          link: "/wallets",
        },
        {
          key: "products",
          label: "Products",
          icon: "mdi-tag",
          link: "/products",
        },
        {
          key: "invoices",
          label: "Invoices",
          icon: "receipt_long",
          link: "/invoices",
        },
        {
          key: "payouts",
          label: "Payouts",
          icon: "mdi-cash",
          link: "/payouts",
        },
        {
          key: "discounts",
          label: "Discounts",
          icon: "mdi-sale-outline",
          link: "/discounts",
        },
        {
          key: "notifications",
          label: "Notifications",
          icon: "mdi-bell",
          link: "/notifications",
        },
        {
          key: "templates",
          label: "Templates",
          icon: "mdi-text-box",
          link: "/templates",
        },
      ],
    }
  },
}
</script>

<style>
.bc-resources {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}
.v-application a.bc-resource {
  display: block;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--bc-border);
  background: var(--bc-surface-2);
  color: inherit;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.v-application a.bc-resource:hover {
  text-decoration: none;
  border-color: rgba(158, 96, 244, 0.5);
  transform: translateY(-1px);
}
.bc-resource__icon {
  color: var(--bc-muted) !important;
}
.bc-resource__value {
  font-size: 1.4rem;
  font-weight: 700;
  margin-top: 8px;
  letter-spacing: -0.02em;
}
.bc-resource__label {
  font-size: 0.78rem;
  color: var(--bc-muted);
}
</style>
