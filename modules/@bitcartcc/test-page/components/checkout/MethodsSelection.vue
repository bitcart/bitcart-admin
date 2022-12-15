<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>Pay with</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action>
      <v-menu v-model="showMenu" offset-y style="max-width: 600px">
        <template #activator="{ on, attrs }">
          <v-list-item-title
            class="text-subtitle-1 font-weight-light"
            :class="currencySelectClass"
            v-bind="attrs"
            v-on="on"
            >{{ itemv.name }}
            <v-icon v-if="invoice.payments.length > 1" small
              >mdi-chevron-down</v-icon
            ></v-list-item-title
          >
        </template>
        <v-list>
          <v-list-item-group
            :value="selectedCurrency"
            mandatory
            @change="$emit('update:selectedCurrency', $event)"
          >
            <v-list-item v-for="(item, index) in invoice.payments" :key="index">
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </v-list-item-action>
  </v-list-item>
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
    currencySelectClass: {
      type: Object,
      required: true,
    },
    selectedCurrency: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      showMenu: false,
    }
  },
}
</script>

<style scoped>
.multipleCurrency {
  border-width: 1px;
  border-style: solid;
  padding: 6px;
  overflow: auto !important;
}
.v-application.theme--light .multipleCurrency {
  border-color: rgba(0, 0, 0, 0.12);
}
.v-application.theme--dark .multipleCurrency {
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
