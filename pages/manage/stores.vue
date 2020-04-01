<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in policies"
      :key="policy"
      :title="titles[policy]"
      :what="policy"
      :initial-value="value"
      type="integer"
      policy-url="manage/stores"
    />
  </div>
</template>
<script>
import PolicySetting from '@/components/PolicySetting.vue'
export default {
  layout: 'admin',
  middleware: 'superuserOnly',
  components: {
    PolicySetting
  },
  data () {
    return {
      policies: {},
      titles: {
        pos_id: 'ID of the store to enable on POS'
      }
    }
  },
  beforeMount () {
    this.$axios.get('/manage/stores').then(resp => (this.policies = resp.data))
  }
}
</script>
