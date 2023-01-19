<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-card class="elevation-12">
        <v-toolbar color="primary" dark flat>
          <v-spacer />
          <v-toolbar-title>Two-factor authentication</v-toolbar-title>
          <div class="flex-grow-1" />
        </v-toolbar>
        <v-card-text>
          <h2 v-if="!tfa_types.length">
            No two-factor authentication required
          </h2>
          <div>
            <component
              :is="component"
              v-for="(component, tfaType) in tfaComponents"
              :key="tfaType"
              :code="code"
              :reset-query="resetQuery"
              class="pb-5"
            />
          </div>
        </v-card-text>
      </v-card>
      <onion-text-field />
    </v-col>
  </v-row>
</template>

<script>
import OnionTextField from "@/components/OnionTextField"

export default {
  auth: "guest",
  components: {
    OnionTextField,
  },
  asyncData({ route }) {
    return {
      code: route.query.code,
      tfa_types: route.query.tfa_types ? route.query.tfa_types.split(",") : [],
    }
  },
  computed: {
    tfaComponents() {
      return Object.fromEntries(
        this.tfa_types.map((tfaType) => {
          return [tfaType, () => import(`@/components/2FA/${tfaType}.vue`)]
        })
      )
    },
  },
  methods: {
    resetQuery() {
      delete this.$route.query.code
      delete this.$route.query.tfa_types
    },
  },
}
</script>
