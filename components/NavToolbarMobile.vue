<template>
  <div class="bc-nav" :class="{ 'bc-nav--mini': mini }">
    <v-list nav dense class="bc-nav__list">
      <template v-for="group in groups">
        <div
          v-if="group.name && !mini"
          :key="`h-${group.name}`"
          class="bc-nav__group section-label"
        >
          {{ group.name }}
        </div>
        <v-divider
          v-else-if="group.name && mini"
          :key="`d-${group.name}`"
          class="my-2 mx-3"
        />
        <v-tooltip
          v-for="item in group.items"
          :key="item.text"
          right
          :disabled="!mini"
        >
          <template #activator="{ on, attrs }">
            <v-list-item
              :to="item.to"
              :href="item.href"
              :exact="item.to === '/'"
              class="bc-nav__item"
              active-class="bc-nav__item--active"
              v-bind="attrs"
              v-on="on"
            >
              <v-list-item-icon v-if="item.icon || item.component">
                <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
                <component :is="item.component" v-else />
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.text" />
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>{{ item.text }}</span>
        </v-tooltip>
      </template>
    </v-list>
    <div v-if="collapsible" class="bc-nav__footer">
      <v-btn
        text
        block
        class="bc-nav__collapse text-muted"
        @click="$emit('input', !value)"
      >
        <v-icon>{{
          value ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"
        }}</v-icon>
        <span v-if="!mini" class="ml-2">Collapse</span>
      </v-btn>
    </div>
  </div>
</template>

<script>
const GROUP_ORDER = ["Overview", "Commerce", "Setup"]
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    // whether the sidebar is collapsed
    value: {
      type: Boolean,
      default: false,
    },
    mini: {
      type: Boolean,
      default: false,
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    groups() {
      if (!this.items.some((item) => item.group))
        return [{ name: null, items: this.items }]
      const groups = {}
      for (const item of this.items) {
        const name = item.group || "More"
        if (!groups[name]) groups[name] = []
        groups[name].push(item)
      }
      const order = (name) => {
        const idx = GROUP_ORDER.indexOf(name)
        return idx === -1 ? GROUP_ORDER.length : idx
      }
      return Object.keys(groups)
        .sort((a, b) => order(a) - order(b))
        .map((name) => ({ name, items: groups[name] }))
    },
  },
}
</script>

<style>
.bc-nav {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.bc-nav__list {
  flex: 1 1 auto;
  padding: 4px 12px !important;
  background: transparent !important;
}
.bc-nav--mini .bc-nav__list {
  padding: 4px 10px !important;
}
.bc-nav__group {
  padding: 18px 12px 8px;
}
.bc-nav__item {
  border-radius: 10px !important;
  min-height: 42px !important;
  margin-bottom: 2px !important;
  color: var(--bc-muted) !important;
  position: relative;
}
.bc-nav__item .v-list-item__title {
  font-size: 0.9rem !important;
  font-weight: 500 !important;
}
.bc-nav__item .v-icon {
  color: inherit !important;
}
.bc-nav__item--active {
  color: var(--v-primary-base) !important;
}
.bc-nav__item--active::before {
  opacity: 0.1 !important;
  background-color: var(--v-primary-base) !important;
}
.bc-nav__item--active::after {
  content: "";
  position: absolute;
  left: -12px;
  top: 10px;
  bottom: 10px;
  width: 3px;
  min-height: 0 !important;
  border-radius: 0 3px 3px 0;
  background: var(--v-primary-base);
}
.bc-nav--mini .bc-nav__item--active::after {
  left: -10px;
}
.bc-nav__footer {
  padding: 12px;
  border-top: 1px solid var(--bc-border);
}
.bc-nav__collapse {
  justify-content: flex-start;
}
.bc-nav--mini .bc-nav__collapse {
  justify-content: center;
}
</style>
