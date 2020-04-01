<template>
  <div>
    <PolicySetting v-for="(value, policy) in policies" :key="policy" :title="titles[policy]" :what="policy" :initial-value="value" />
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
        disable_registration: 'Disable user registration',
        discourage_index: 'Discourage search engines from indexing this site'
      }
    }
  },
  beforeMount () {
    this.$axios.get('/manage/policies').then(resp => (this.policies = resp.data))
  }
}
</script>
