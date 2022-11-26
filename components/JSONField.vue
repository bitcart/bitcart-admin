<template>
  <div>
    <template v-for="(value, key) in data">
      {{ $utils.toTitleCase(key) }}: {{ value }}
    </template>
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
