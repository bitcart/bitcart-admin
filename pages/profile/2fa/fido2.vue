<template>
  <div>
    <h1>FIDO2 Devices</h1>
    <v-row v-for="device in $auth.user.fido2_devices" :key="device.id">
      <v-col cols="12" md="3">
        <v-card>
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5">{{
                device.name
              }}</v-list-item-title>
              <v-list-item-subtitle
                >Security device (FIDO2)</v-list-item-subtitle
              >
            </v-list-item-content>
            <v-list-item-action>
              <v-btn color="error" @click="removeDevice(device.id)"
                >Remove</v-btn
              >
            </v-list-item-action>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="errorText" type="error" v-text="errorText" />
    <v-text-field v-model="deviceName" label="Device name" />
    <v-btn color="primary" @click="register">Register</v-btn>
  </div>
</template>
<script>
import {
  create,
  parseCreationOptionsFromJSON,
} from "@/utils/webauthn-json.browser-ponyfill.js"
export default {
  layout: "profile",
  data() {
    return {
      deviceName: "",
      errorText: "",
    }
  },
  methods: {
    register() {
      if (
        window.PublicKeyCredential === undefined ||
        typeof window.PublicKeyCredential !== "function" ||
        location.protocol === "http:"
      ) {
        this.errorText =
          location.protocol === "http:"
            ? "FIDO2/WebAuthN requires HTTPS"
            : "Your browser does not support FIDO2/WebAuthN"
        return
      }
      this.errorText = ""
      this.$axios
        .post("/users/2fa/fido2/register/begin", {
          auth_host: window.location.hostname,
        })
        .then(async (r) => {
          const options = parseCreationOptionsFromJSON(r.data)
          let response
          try {
            response = await create(options)
          } catch (e) {
            this.errorText =
              "Could not create credentials in browser. Probably because the username is already registered with your authenticator. Please change username or authenticator"
            return
          }
          try {
            await this.$axios.post("/users/2fa/fido2/register/complete", {
              name: this.deviceName,
              auth_host: window.location.hostname,
              ...response.toJSON(),
            })
          } catch (e) {
            this.errorText = e.response.data.detail
            return
          }
          await this.$auth.fetchUser()
        })
    },
    removeDevice(id) {
      this.$axios
        .delete("/users/2fa/fido2/" + id)
        .then((r) => {
          this.$auth.fetchUser()
        })
        .catch((e) => {
          this.errorText = e.response.data.detail
        })
    },
  },
}
</script>
