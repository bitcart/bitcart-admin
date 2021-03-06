<template>
  <v-toolbar>
    <v-toolbar-items>
      <v-btn to="/" text>
        <v-icon left> mdi-view-dashboard-outline </v-icon>Dashboard
      </v-btn>
      <v-btn to="/services" text>
        <v-img
          :src="`${STATIC_PATH}/onion.svg`"
          height="32"
          width="32"
          contain
        />Tor Services
      </v-btn>
      <v-btn to="/configurator" text>
        <v-icon left> mdi-cog </v-icon>Configurator
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
</template>
