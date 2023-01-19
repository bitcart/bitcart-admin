<template>
  <div>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied recovery codes to clipboard!
    </v-snackbar>
    <div v-if="recoveryCodes.length > 0">
      <v-alert type="warning" dense text>
        <p class="text-h6">Put those codes in a safe place</p>
        If you lose your device and don't have the recovery codes you will lose
        access to your account.
      </v-alert>
      <ul>
        <li v-for="recoveryCode in recoveryCodes" :key="recoveryCode">
          <code>{{ recoveryCode }}</code>
        </li>
      </ul>
      <v-btn color="primary" class="mt-3" @click="copyCodes"
        >Copy to clipboard</v-btn
      >
      <v-btn color="primary" class="mt-3" @click="$router.push('/profile')"
        >I wrote down my recovery codes</v-btn
      >
    </div>
    <div v-else>
      <h1>Enable Authenticator</h1>
      <p>To use an authenticator app go through the following steps:</p>
      <ol>
        <li>
          Download a two-factor authenticator app like …
          <ul>
            <li>
              Authy for
              <a
                href="https://play.google.com/store/apps/details?id=com.authy.authy"
                rel="noreferrer noopener"
                target="_blank"
                >Android</a
              >
              or
              <a
                href="https://apps.apple.com/us/app/authy/id494168017"
                rel="noreferrer noopener"
                target="_blank"
                >iOS</a
              >
            </li>
            <li>
              Microsoft Authenticator for
              <a
                href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                rel="noreferrer noopener"
                target="_blank"
                >Android</a
              >
              or
              <a
                href="https://apps.apple.com/us/app/microsoft-authenticator/id983156458"
                rel="noreferrer noopener"
                target="_blank"
                >iOS</a
              >
            </li>
            <li>
              Google Authenticator for
              <a
                href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
                rel="noreferrer noopener"
                target="_blank"
                >Android</a
              >
              or
              <a
                href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                rel="noreferrer noopener"
                target="_blank"
                >iOS</a
              >
            </li>
          </ul>
        </li>
        <li>
          Scan the QR Code or enter the following key into your two-factor
          authenticator app:<br />
          <code>{{ $auth.user.totp_key }}</code>
          <qrcode
            :options="{ width: 240 }"
            :value="$auth.user.totp_url"
            tag="v-img"
            class="py-3 d-flex justify-start"
          />
        </li>
        <li>
          Your two-factor authenticator app will provide you with a unique code.
          Enter the code in the confirmation box below.
        </li>
      </ol>
      <v-form @submit.prevent="verifyCode">
        <v-text-field
          id="tfa_code"
          v-model="code"
          label="Verification code"
          :error-messages="errors"
          class="pb-2"
          type="text"
          name="tfa_code"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="one-time-code"
        />
        <v-btn color="primary" type="submit">Verify</v-btn>
      </v-form>
    </div>
  </div>
</template>
<script>
export default {
  layout: "profile",
  data() {
    return {
      code: "",
      errors: [],
      recoveryCodes: [],
      showSnackbar: false,
    }
  },
  methods: {
    verifyCode() {
      this.errors = []
      this.$axios
        .post("/users/2fa/totp/verify", { code: this.code })
        .then((r) => {
          this.recoveryCodes = r.data
          this.$auth.fetchUser()
        })
        .catch((e) => {
          if (e.response.data.detail === "Invalid code") {
            this.errors = ["Invalid code"]
          }
        })
    },
    copyCodes() {
      this.$utils.copyToClipboard(this.recoveryCodes.join("\n"))
      this.showSnackbar = true
    },
  },
}
</script>
