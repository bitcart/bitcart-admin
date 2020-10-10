<template>
  <item-data :headers="headers" :url="url" :title="title">
    <template v-slot:item.is_superuser="{ item }">
      <v-switch v-model="item.is_superuser" @change="updateSuperuser(item)" />
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
export default {
  layout: "admin",
  middleware: "superuserOnly",
  components: {
    ItemData,
  },
  data() {
    return {
      headers: [
        { text: "Email", value: "email", rules: ["required", "email"] },
        {
          text: "Password",
          value: "password",
          mode: "nodisplay",
          input: "password",
          rules: ["required", "min"],
          hint: "At least 8 characters",
        },
        {
          text: "Superuser",
          value: "is_superuser",
          input: "switch",
          default: false,
        },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "users",
      title: "User",
    }
  },
  methods: {
    updateSuperuser(item) {
      this.$axios.patch(`/${this.url}/${item.id}`, item)
    },
  },
}
</script>
