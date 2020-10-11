<template>
  <div v-if="$route.query.modal" class="text-right">
    <v-btn icon @click="$emit('closedialog')">
      <v-icon> close </v-icon>
    </v-btn>
  </div>
</template>
