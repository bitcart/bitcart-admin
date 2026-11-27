<template>
  <div class="bc-dashboard">
    <v-alert
      v-if="showWalletsWarning"
      type="warning"
      text
      dismissible
      class="mb-6"
    >
      You have a large number of wallets ({{ $store.state.stats.wallets }}). It
      is recommended to disable balance fetching in your profile settings for
      better performance.
    </v-alert>

    <div class="page-header">
      <div>
        <div class="section-label mb-1">{{ todayText }}</div>
        <h1>
          {{ greeting }}<span v-if="userName">, {{ userName }}</span>
        </h1>
        <div class="text-muted mt-1">
          Here's what's happening with your stores.
        </div>
      </div>
      <div class="d-flex align-center flex-wrap" style="gap: 10px">
        <v-chip
          v-if="otherCurrencies.length"
          small
          outlined
          class="text-muted"
          :title="`Charts show ${currency} only`"
        >
          <v-icon small left>mdi-information-outline</v-icon>
          +{{ otherCurrencies.length }} other currencies
        </v-chip>
        <v-btn-toggle
          v-model="range"
          mandatory
          dense
          rounded
          class="bc-range"
          color="primary"
        >
          <v-btn v-for="r in ranges" :key="r" :value="r" small>{{ r }}d</v-btn>
        </v-btn-toggle>
        <v-btn icon class="bc-icon-btn" :loading="loading" @click="load">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <UIExtensionSlot
      name="dashboard"
      :cards="cards"
      :wallet-texts="walletTexts"
    >
      <v-row class="mx-n2">
        <v-col cols="12" sm="6" lg="3" class="pa-2">
          <StatCard
            label="Wallets balance"
            icon="mdi-wallet-outline"
            color="#9E60F4"
            link="/wallets"
            :value="balanceText"
            :caption="balanceCaption"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="3" class="pa-2">
          <StatCard
            label="Revenue"
            icon="mdi-cash-multiple"
            color="#22C55E"
            link="/invoices"
            :value="revenueText"
            :caption="`vs. previous ${range} days`"
            :delta="revenueDelta"
            :sparkline="revenueSpark"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="3" class="pa-2">
          <StatCard
            label="Paid invoices"
            icon="mdi-check-decagram-outline"
            color="#22D3EE"
            link="/invoices"
            :value="paidCount"
            :caption="`${current.length} created in total`"
            :delta="paidDelta"
            :sparkline="paidSpark"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="3" class="pa-2">
          <StatCard
            label="Conversion rate"
            icon="mdi-percent-outline"
            color="#F59E0B"
            :value="`${conversion.toFixed(1)}%`"
            :caption="`Average order ${averageText}`"
            :delta="conversionDelta"
            :loading="loading"
          />
        </v-col>
      </v-row>

      <v-row class="mx-n2">
        <v-col cols="12" lg="8" class="pa-2">
          <RevenueChart
            :buckets="buckets"
            :currency="currency"
            :days="range"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" lg="4" class="pa-2">
          <StatusDonut
            :breakdown="breakdown"
            :days="range"
            :loading="loading"
          />
        </v-col>
      </v-row>

      <v-row class="mx-n2">
        <v-col cols="12" md="6" class="pa-2">
          <TopStoresChart
            :stores="topStores"
            :store-names="storeNames"
            :currency="currency"
            :loading="loading"
          />
        </v-col>
        <v-col cols="12" md="6" class="pa-2">
          <RecentInvoices :invoices="recentInvoices" :loading="loading" />
        </v-col>
      </v-row>

      <v-row class="mx-n2">
        <v-col cols="12" lg="8" class="pa-2">
          <ResourceGrid />
        </v-col>
        <v-col cols="12" lg="4" class="pa-2">
          <QuickActions />
        </v-col>
      </v-row>

      <v-row class="mx-n2">
        <UIExtensionSlot
          name="info_card"
          component="v-col"
          class="col-md-3 col-12 pa-2"
        />
      </v-row>
    </UIExtensionSlot>
  </div>
</template>

<script>
import UIExtensionSlot from "@/components/UIExtensionSlot"
import StatCard from "@/components/dashboard/StatCard"
import RevenueChart from "@/components/dashboard/RevenueChart"
import StatusDonut from "@/components/dashboard/StatusDonut"
import TopStoresChart from "@/components/dashboard/TopStoresChart"
import RecentInvoices from "@/components/dashboard/RecentInvoices"
import ResourceGrid from "@/components/dashboard/ResourceGrid"
import QuickActions from "@/components/dashboard/QuickActions"
import {
  splitPeriods,
  bucketByDay,
  statusBreakdown,
  groupByStore,
  pickPrimaryCurrency,
  revenueByCurrency,
  pctDelta,
  isPaid,
  formatMoney,
} from "@/utils/dashboard"

const PAGE_SIZE = 500
const MAX_INVOICES = 5000

export default {
  components: {
    UIExtensionSlot,
    StatCard,
    RevenueChart,
    StatusDonut,
    TopStoresChart,
    RecentInvoices,
    ResourceGrid,
    QuickActions,
  },
  layout: "dashboard",
  data() {
    return {
      ranges: [7, 30, 90],
      range: 30,
      loading: true,
      invoices: [],
      latest: [],
      storeNames: {},
      requestId: 0,
      // kept for plugins extending the "dashboard" slot
      cards: [
        {
          texts: [{ header: "Notifications", key: "notifications" }],
          link: "/notifications",
        },
        {
          texts: [{ header: "Templates", key: "templates" }],
          link: "/templates",
        },
        { texts: [{ header: "Stores", key: "stores" }], link: "/stores" },
        {
          texts: [{ header: "Discounts", key: "discounts" }],
          link: "/discounts",
        },
        {
          texts: [{ header: "Total products", key: "products" }],
          link: "/products",
        },
        {
          texts: [{ header: "Total invoices", key: "invoices" }],
          link: "/invoices",
        },
        {
          texts: [{ header: "Total payouts", key: "payouts" }],
          link: "/payouts",
        },
      ],
    }
  },
  computed: {
    user() {
      return this.$auth.user
    },
    userName() {
      const email = this.user && this.user.email
      if (!email) return ""
      const name = email.split("@")[0].split(/[._-]/)[0]
      return name.charAt(0).toUpperCase() + name.slice(1)
    },
    greeting() {
      const hours = new Date().getHours()
      if (hours < 5) return "Good night"
      if (hours < 12) return "Good morning"
      if (hours < 18) return "Good afternoon"
      return "Good evening"
    },
    todayText() {
      return new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    },
    showWalletsWarning() {
      return (
        this.$store.state.stats.wallets >= 100 &&
        this.user &&
        this.user.settings.fetch_balance
      )
    },
    balanceCurrency() {
      return (this.user && this.user.settings.balance_currency) || "USD"
    },
    balanceText() {
      if (this.user && !this.user.settings.fetch_balance)
        return "Disabled in settings"
      return formatMoney(
        parseFloat(this.$store.state.balance) || 0,
        this.balanceCurrency
      )
    },
    balanceCaption() {
      const missing = this.$store.state.missingRates
      const wallets = `${this.$store.state.stats.wallets || 0} wallets connected`
      return missing.length
        ? `${wallets} · not included (no rate): ${missing.join(", ")}`
        : wallets
    },
    // compatibility with plugins using the old InfoCard texts
    walletTexts() {
      const fetchBalanceText = this.user
        ? this.user.settings.fetch_balance
          ? null
          : "Disabled in settings"
        : null
      return [
        {
          header: "Wallets Balance",
          customText: fetchBalanceText,
          mainValue: this.$store.state.balance || 0,
          value: this.user ? this.user.settings.balance_currency : 0,
          note: this.$store.state.missingRates.length
            ? `Not included, no exchange rate: ${this.$store.state.missingRates.join(", ")}`
            : null,
        },
        {
          header: "Total wallets connected:",
          key: "wallets",
          value: "wallets connected",
        },
      ]
    },
    periods() {
      return splitPeriods(this.invoices, this.range)
    },
    current() {
      return this.periods.current
    },
    previous() {
      return this.periods.previous
    },
    currency() {
      return pickPrimaryCurrency(
        this.current.length ? this.current : this.invoices,
        this.balanceCurrency
      ).toUpperCase()
    },
    otherCurrencies() {
      return Object.keys(revenueByCurrency(this.current)).filter(
        (c) => c && c !== this.currency
      )
    },
    buckets() {
      return bucketByDay(this.current, this.range, this.currency, new Date())
    },
    revenue() {
      return revenueByCurrency(this.current)[this.currency] || 0
    },
    previousRevenue() {
      return revenueByCurrency(this.previous)[this.currency] || 0
    },
    revenueText() {
      return formatMoney(this.revenue, this.currency)
    },
    revenueDelta() {
      return pctDelta(this.revenue, this.previousRevenue)
    },
    revenueSpark() {
      return this.buckets.map((b) => +b.revenue.toFixed(2))
    },
    paidCount() {
      return this.current.filter(isPaid).length
    },
    paidDelta() {
      return pctDelta(this.paidCount, this.previous.filter(isPaid).length)
    },
    paidSpark() {
      return this.buckets.map((b) => b.paid)
    },
    conversion() {
      return this.current.length
        ? (this.paidCount / this.current.length) * 100
        : 0
    },
    conversionDelta() {
      if (!this.previous.length || !this.current.length) return null
      const prev =
        (this.previous.filter(isPaid).length / this.previous.length) * 100
      return this.conversion - prev
    },
    averageText() {
      const paidInCurrency = this.current.filter(
        (i) => isPaid(i) && (i.currency || "").toUpperCase() === this.currency
      ).length
      return formatMoney(
        paidInCurrency ? this.revenue / paidInCurrency : 0,
        this.currency
      )
    },
    breakdown() {
      return statusBreakdown(this.current)
    },
    topStores() {
      return groupByStore(
        this.current.map((i) => ({
          ...i,
          currency: (i.currency || "").toUpperCase(),
        })),
        this.currency
      )
    },
    recentInvoices() {
      return (this.latest.length ? this.latest : this.invoices).slice(0, 6)
    },
  },
  watch: {
    range() {
      this.load()
    },
  },
  mounted() {
    this.load()
    this.loadStores()
  },
  methods: {
    async fetchInvoices(days) {
      const query = encodeURIComponent(`start_date:-${days}d`)
      let result = []
      let offset = 0
      let count = Infinity
      while (offset < count && offset < MAX_INVOICES) {
        const { data } = await this.$axios.get(
          `/invoices?offset=${offset}&limit=${PAGE_SIZE}&query=${query}&sort=created&desc=true`
        )
        result = result.concat(data.result || [])
        count = data.count || 0
        offset += PAGE_SIZE
        if (!data.result || data.result.length < PAGE_SIZE) break
      }
      return result
    },
    async load() {
      const requestId = ++this.requestId
      this.loading = true
      try {
        const [invoices, latest] = await Promise.all([
          this.fetchInvoices(this.range * 2),
          this.$axios
            .get("/invoices?offset=0&limit=6&sort=created&desc=true")
            .then((r) => r.data.result || [])
            .catch(() => []),
        ])
        if (requestId !== this.requestId) return
        this.invoices = invoices
        this.latest = latest
      } catch (e) {
        if (requestId === this.requestId) this.invoices = []
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    },
    loadStores() {
      this.$axios
        .get("/stores?limit=-1")
        .then(({ data }) => {
          const names = {}
          for (const store of data.result || []) names[store.id] = store.name
          this.storeNames = names
        })
        .catch(() => {})
    },
  },
}
</script>

<style>
.bc-dashboard .bc-range {
  border: 1px solid var(--bc-border);
  background: var(--bc-surface-2) !important;
  padding: 3px;
}
.bc-dashboard .bc-range .v-btn {
  border: none !important;
  border-radius: 999px !important;
  height: 30px !important;
  min-width: 52px !important;
  background: transparent !important;
}
.bc-dashboard .bc-range .v-btn.v-btn--active::before {
  opacity: 0.16 !important;
}
</style>
