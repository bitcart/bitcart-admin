<template>
  <div>
    <v-list class="mb-5 mt-0 py-0">
      <v-container class="py-0">
        <v-form ref="form">
          <v-row>
            <v-col v-for="header in fields" :key="header.value" :cols="6">
              <v-text-field
                v-if="typeof header.input === 'undefined'"
                v-model="data[header.value]"
                :rules="header.rules"
                :label="header.text"
                persistent-hint
                @input="sendInput"
              />
              <v-switch
                v-else-if="header.input === 'switch'"
                v-model="data[header.value]"
                :rules="header.rules"
                :label="header.text"
                @input="sendInput"
              />
              <v-btn
                v-else-if="header.input === 'button'"
                color="primary"
                @click="header.click(data)"
              >
                {{ header.text }}
              </v-btn>
              <div
                v-else-if="header.input === 'progress'"
                v-show="
                  customProps[header.loading] || customProps[header.status]
                "
              >
                <v-progress-circular
                  v-if="customProps[header.loading]"
                  indeterminate
                />
                <div v-else>
                  <p>
                    {{ customProps[header.text] }}
                    <span>
                      <v-icon>
                        {{ customProps[header.status] }}
                      </v-icon>
                    </span>
                  </p>
                </div>
              </div>
              <v-text-field
                v-else
                v-model="data[header.value]"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="header.rules"
                :type="showPassword ? 'text' : 'password'"
                :label="header.text"
                :hint="header.hint"
                name="input-10-1"
                counter
                @click:append="showPassword = !showPassword"
                @input="sendInput"
              />
            </v-col>
            <v-col :cols="6">
              <menu-dropdown
                :items="$utils.emailPresets"
                :process="loadPreset"
                title="Load preset"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-list>
  </div>
</template>

<script>
// TODO: refactor all form inputs to one universal component
import debounce from "lodash.debounce"
import MenuDropdown from "@/components/MenuDropdown"
export default {
  components: {
    MenuDropdown,
  },
  props: {
    initialValue: {
      type: [Array, Object],
      default: () => [],
    },
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: this.initialValue,
      fields: [
        {
          text: "Server email",
          value: "email",
          rules: [this.$utils.rules.email],
        },
        { text: "Email host", value: "email_host" },
        {
          text: "Email port",
          value: "email_port",
          rules: [this.$utils.rules.int],
        },
        { text: "Email user", value: "email_user" },
        { text: "Email password", value: "email_password", input: "password" },
        { text: "SSL/TLS", value: "email_use_ssl", input: "switch" },
        { text: "Test ping", input: "button", click: this.testping },
        {
          input: "progress",
          text: "emailCheck",
          loading: "loadingEmail",
          status: "emailStatus",
        },
      ],
      customProps: { loadingEmail: false, emailCheck: "", emailStatus: "" },
      showPassword: false,
    }
  },
  beforeMount() {
    this.sendInput = debounce(this.sendInputUnlimited, 250)
  },
  methods: {
    sendInputUnlimited() {
      if (!this.$refs.form.validate()) return
      this.$emit("input", this.data)
    },
    testping(item) {
      this.customProps.emailCheck = ""
      this.customProps.loadingEmail = true
      this.$axios.get(`/manage/testping`).then((resp) => {
        this.customProps.loadingEmail = false
        if (resp.status === 200 && resp.data === true) {
          this.customProps.emailCheck = "Ping successful"
          this.customProps.emailStatus = "mdi-check"
        } else {
          this.customProps.emailCheck = "Error pinging email server"
          this.customProps.emailStatus = "mdi-close"
        }
      })
    },
    loadPreset(preset) {
      for (const key in preset) {
        this.data[key] = preset[key]
      }
      this.sendInputUnlimited()
    },
  },
}
</script>
