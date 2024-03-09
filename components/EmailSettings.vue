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
                :label="header.text"
                persistent-hint
                @input="sendInput"
              />
              <v-switch
                v-else-if="header.input === 'switch'"
                v-model="data[header.value]"
                :label="header.text"
                @change="sendInput"
              />
              <v-select
                v-else-if="header.input === 'select'"
                v-model="data[header.value]"
                :items="header.items"
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
          value: "address",
        },
        { text: "Email host", value: "host" },
        {
          text: "Email port",
          value: "port",
        },
        { text: "Email user", value: "user" },
        { text: "Email password", value: "password", input: "password" },
        {
          text: "Auth mode",
          value: "auth_mode",
          input: "select",
          items: ["none", "ssl/tls", "starttls"],
        },
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
        this.$set(this.data, key, preset[key])
      }
      this.sendInputUnlimited()
    },
  },
}
</script>
