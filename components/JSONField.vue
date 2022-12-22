<template>
  <div>
    <div v-for="(value, key) in data" :key="key" style="white-space: nowrap">
      <p>
        {{ $utils.toTitleCase(key) }}: <br /><span>
          <div style="white-space: pre" v-text="value"
        /></span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
}
</script>
