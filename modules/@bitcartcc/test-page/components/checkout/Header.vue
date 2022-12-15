<template>
  <div style="display: contents">
    <v-img contain max-height="40" :src="logoUrl" class="mb-2">
      <close-button @closedialog="$emit('closedialog')" />
    </v-img>
    <v-progress-linear
      :value="expirationPercentage"
      height="25"
      :color="mainProgressColor"
      :background-color="backgroundProgressColor"
      class="mx-0"
    >
      <v-progress-circular
        indeterminate
        size="18"
        color="white"
        width="3"
        class="ml-2"
      />
      <p class="my-auto px-3 white--text text-subtitle-2">
        {{ expiringSoon ? "Invoice expiring soon..." : "Awaiting payment..." }}
      </p>
      <v-spacer />
      <p class="white--text my-auto text-subtitle-2 px-3">
        {{ timerText }}
      </p>
    </v-progress-linear>
  </div>
</template>

<script>
import CloseButton from "@/components/CloseButton"
export default {
  components: {
    CloseButton,
  },
  props: {
    timerText: {
      type: String,
      required: true,
    },
    expirationPercentage: {
      type: Number,
      required: true,
    },
    expiringSoon: {
      type: Boolean,
      required: true,
    },
    mainProgressColor: {
      type: String,
      required: true,
    },
    backgroundProgressColor: {
      type: String,
      required: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
  },
}
</script>
