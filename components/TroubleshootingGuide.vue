<template>
  <v-container>
    <v-row class="justify-center">
      <v-col cols="12" md="5">
        <p class="text-h3">{{ title }}</p>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="5">
        <p class="text-h5">Unable to access Merchants API. Is it running?</p>
      </v-col>
    </v-row>
    <v-row v-if="$store.state.apiError" class="justify-center">
      <v-col cols="12" md="5">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header> Error details </v-expansion-panel-header>
            <v-expansion-panel-content>
              <code>{{ $store.state.apiError }}</code>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="5">
        <p class="text-h6">
          Check out
          <a
            href="https://docs.bitcart.ai/support-and-community/troubleshooting-an-issue"
            target="_blank"
            >this guide</a
          >
          for more information on how to troubleshoot the issue.
        </p>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="12" md="5">
        <p class="text-h6">
          Quick steps to try:<br />
          1. Ensure merchants API is running. If you are developing locally,
          Bitcart assumes it is running on port 8000 by default.<br />
          2. Make sure <code>BITCART_ADMIN_API_URL</code> is set to the correct
          URL.<br />
          3. If you are using Bitcart with ssl enabled, Merchants API's ssl
          certificate might not have been generated yet. Please retry a bit
          later.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
}
</script>
