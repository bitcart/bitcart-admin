<template>
  <v-list-item class="ma-0 pa-0">
    <v-list-item-content class="ma-0 pa-0">
      <v-form ref="additionalForm" @submit.prevent="updateAdditional">
        <v-card flat>
          <v-card-text>
            <p class="d-flex justify-center text-h5">
              Shipping address & notes
            </p>
            <p class="d-flex justify-center">
              Please provide your shipping address below. You may leave
              additional notes regarding your order.
            </p>
            <v-text-field
              :value="inputAddress"
              label="Shipping address"
              :rules="[rules.required]"
              @input="$emit('update:inputAddress', $event)"
            />
            <v-text-field
              :value="inputNotes"
              label="Notes"
              @input="$emit('update:inputNotes', $event)"
            />
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn color="primary" type="submit" :loading="additionalUpdating"
              >Continue</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  props: {
    updateAdditional: {
      type: Function,
      required: true,
    },
    inputAddress: {
      type: String,
      required: true,
    },
    inputNotes: {
      type: String,
      required: true,
    },
    additionalUpdating: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      rules: this.$utils.rules,
    }
  },
  mounted() {
    this.$emit("update:additionalFormRef", this.$refs.additionalForm)
  },
}
</script>
