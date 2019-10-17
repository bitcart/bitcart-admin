<template>
  <v-card max-width="350" class="mx-auto">
    <div v-for="text in texts" :key="text.header">
      <v-card-title>{{ text.header }}</v-card-title>
      <v-card-text>
        <h1 class="text--primary">
          {{ text.value }}
        </h1>
      </v-card-text>
    </div>
    <v-card-actions>
      <v-btn :to="link" color="primary">
        Details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: { texts: { type: Array, default () { return [] } }, link: { type: String, required: true } }
}
</script>
