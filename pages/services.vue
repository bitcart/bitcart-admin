<template>
  <div>
    <div v-if="noServices" class="pt-5">
      No hidden services found. Enable tor via
      <code>export BITCART_ADDITIONAL_COMPONENTS=tor; ./setup.sh</code>
      to enable hidden services
    </div>
    <v-list v-if="!noServices">
      <div v-for="(service, name) in $store.state.services" :key="name">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h4 pb-4" v-text="name" />
            <v-list-item-subtitle class="text--primary">
              <p class="text-h4">General information</p>
              <p class="title">Hostname</p>
              <p class="subtitle">
                {{ service.hostname }}
              </p>
              <div v-if="$auth.user.is_superuser">
                <p class="title">Directory</p>
                <p class="subtitle">
                  {{ service.directory }}
                </p>
                <div v-if="service.port_definition">
                  <p class="text-h4">Port definition</p>
                  <p class="title">Virtual port</p>
                  <p class="subtitle">
                    {{ service.port_definition.virtual_port }}
                  </p>
                  <p class="title">IP Address</p>
                  <p class="subtitle">
                    {{ service.port_definition.ip }}
                  </p>
                  <p class="title">Port</p>
                  <p class="subtitle">
                    {{ service.port_definition.port }}
                  </p>
                </div>
              </div>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
      </div>
    </v-list>
  </div>
</template>

<script>
export default {
  computed: {
    noServices() {
      return this.$utils.isEmpty(this.$store.state.services)
    },
  },
}
</script>
