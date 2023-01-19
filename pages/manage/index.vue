<template>
  <item-data :headers="headers" :url="url" :title="title">
    <template #item.is_superuser="{ item }">
      <v-switch v-model="item.is_superuser" @change="updateSuperuser(item)" />
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import JSONField from "@/components/JSONField.vue"
export default {
  components: {
    ItemData,
  },
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "Email",
          value: "email",
          rules: ["required", "email"],
          errors: {
            'duplicate key value violates unique constraint "users_email_idx"':
              "This user already exists",
          },
        },
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
        {
          text: "Metadata",
          value: "metadata",
          input: "metadata",
          expand: true,
          component: JSONField,
        },
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
