<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in policies"
      :key="policy"
      :title="descriptions[policy].title"
      :what="policy"
      :type="descriptions[policy].type"
      :initial-value="value"
      policy-url="manage/stores"
    />
  </div>
</template>
<script>
import PolicySetting from "@/components/PolicySetting.vue"
export default {
  components: {
    PolicySetting,
  },
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      policies: {},
      descriptions: this.$utils.getExtendSetting.call(
        this,
        "store_policy_descriptions",
        {
          pos_id: { title: "ID of the store to enable on POS", type: "string" },
          email_required: {
            title: "Require email on POS checkout",
            type: "checkbox",
          },
        }
      ),
    }
  },
  beforeMount() {
    this.$axios
      .get("/manage/stores")
      .then((resp) => (this.policies = resp.data))
  },
}
</script>
