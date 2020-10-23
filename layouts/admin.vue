<template>
  <Dashboard>
    <v-toolbar class="mb-3 hidden-sm-and-down">
      <v-toolbar-items>
        <v-btn v-for="item in items" :key="item.text" :to="item.to" exact text>
          {{ item.text }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <div class="mb-3 hidden-md-and-up">
      <v-divider />
      <v-list>
        <v-list-item v-for="item in items" :key="item.text" :to="item.to" exact>
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
    </div>
  </Dashboard>
</template>
<script>
import Dashboard from "@/layouts/dashboard"
export default {
  components: {
    Dashboard,
  },
  data() {
    return {
      drawer: true,
      items: [
        { text: "User management", to: "/manage" },
        { text: "Maintenance commands", to: "/manage/maintenance" },
        { text: "Policies", to: "/manage/policies" },
        { text: "Store Policies", to: "/manage/stores" },
        { text: "Daemons management", to: "/manage/daemons" },
      ],
    }
  },
}
</script>
