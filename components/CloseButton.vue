<template>
  <div v-if="show" class="text-right">
    <v-btn icon @click="$emit('closedialog')">
      <v-icon> close </v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: null,
      default() {
        return this.$route.query.modal
      },
    },
  },
}
</script>
