<template>
  <v-list-item class="ma-0 pa-0">
    <v-list-item-content class="ma-0 pa-0">
      <v-form ref="emailForm" @submit.prevent="updateEmail">
        <v-card flat>
          <v-card-text>
            <p class="d-flex justify-center text-h5">Contact & Refund Email</p>
            <p class="d-flex justify-center">
              Please provide an email address below. We will contact you at this
              address if there is an issue with your payment.
            </p>
            <v-text-field
              :value="inputEmail"
              label="Your email"
              :rules="[rules.required, rules.email]"
              @input="$emit('update:inputEmail', $event)"
            />
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn color="primary" type="submit" :loading="emailUpdating"
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
    updateEmail: {
      type: Function,
      required: true,
    },
    inputEmail: {
      type: String,
      required: true,
    },
    emailUpdating: {
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
    this.$emit("update:emailFormRef", this.$refs.emailForm)
  },
}
</script>
