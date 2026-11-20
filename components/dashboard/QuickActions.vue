<template>
  <v-card class="bc-panel" height="100%">
    <div class="bc-panel__head">
      <div>
        <div class="bc-panel__title">Quick actions</div>
        <div class="text-caption text-muted">Jump right in</div>
      </div>
    </div>
    <div class="px-4 pb-4">
      <nuxt-link
        v-for="action in actions"
        :key="action.title"
        :to="action.link"
        class="bc-action"
      >
        <div
          class="bc-action__icon"
          :style="{ background: `${action.color}1f` }"
        >
          <v-icon :color="action.color" size="20">{{ action.icon }}</v-icon>
        </div>
        <div class="flex-grow-1">
          <div class="font-weight-semibold">{{ action.title }}</div>
          <div class="text-caption text-muted">{{ action.text }}</div>
        </div>
        <v-icon small class="text-muted">mdi-chevron-right</v-icon>
      </nuxt-link>
    </div>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      actions: [
        {
          title: "New invoice",
          text: "Request a crypto payment",
          icon: "receipt_long",
          color: "#9E60F4",
          link: "/invoices",
        },
        {
          title: "Connect wallet",
          text: "Add a wallet to receive funds",
          icon: "mdi-wallet-plus",
          color: "#22C55E",
          link: "/wallets",
        },
        {
          title: "Create store",
          text: "Set up a new storefront",
          icon: "mdi-store-plus",
          color: "#22D3EE",
          link: "/stores",
        },
        {
          title: "Add product",
          text: "List something to sell",
          icon: "mdi-tag-plus",
          color: "#F59E0B",
          link: "/products",
        },
      ],
    }
  },
}
</script>

<style>
.v-application a.bc-action {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  color: inherit;
  transition: background 0.15s ease;
}
.v-application a.bc-action:hover {
  background: var(--bc-hover);
  text-decoration: none;
}
.bc-action__icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
</style>
