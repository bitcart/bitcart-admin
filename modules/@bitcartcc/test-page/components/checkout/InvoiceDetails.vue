<template>
  <div style="display: contents">
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>{{ store.name }}</v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-list-item-title
          class="text-subtitle-1 font-weight-regular align-right"
          >{{ itemv.amount }}
          {{ itemv.symbol.toUpperCase() }}</v-list-item-title
        >
        <v-list-item-title class="text-caption font-weight-regular align-right">
          1 {{ itemv.symbol.toUpperCase() }} =
          {{ itemv.rate_str }}
        </v-list-item-title>
      </v-list-item-action>
    </v-list-item>
    <v-row class="mt-n5" no-gutters>
      <v-btn
        icon
        x-small
        class="justify-center mx-auto"
        @click="showDetails = !showDetails"
      >
        <v-icon>{{ showDetails ? "mdi-arrow-up" : "mdi-arrow-down" }}</v-icon>
      </v-btn>
    </v-row>
    <v-divider v-if="showDetails" />
    <v-list-item v-if="showDetails">
      <v-list-item-content>
        <v-list-item-title>Order amount</v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-list-item-title
          class="text-subtitle-1 font-weight-regular align-right"
        >
          {{ invoice.price }}
          {{ invoice.currency }}
        </v-list-item-title>
      </v-list-item-action>
    </v-list-item>
  </div>
</template>

<script>
export default {
  props: {
    invoice: {
      type: Object,
      required: true,
    },
    itemv: {
      type: Object,
      required: true,
    },
    store: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showDetails: false,
    }
  },
}
</script>
