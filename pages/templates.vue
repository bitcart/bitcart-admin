<template>
  <div style="display: contents">
    <item-data
      :headers="headers"
      :url="url"
      :title="title"
      :actions="actions"
    />
    <v-dialog v-model="testDialog" max-width="700px">
      <v-card>
        <v-card-title>Test template</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="testName"
                :items="templateNames"
                label="Test as"
                clearable
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="testOwnerId"
                label="Store or product ID (optional, generated data otherwise)"
                clearable
              />
            </v-col>
          </v-row>
          <v-alert v-if="testResult && !testResult.ok" type="error" text>
            <div v-if="testResult.line">
              Line {{ testResult.line }}: {{ testResult.source_line }}
            </div>
            <div>{{ testResult.error }}</div>
          </v-alert>
          <v-alert v-if="testError" type="error" text>{{ testError }}</v-alert>
          <v-alert
            v-if="testResult && testResult.ok && !testResult.text.trim()"
            type="info"
            text
          >
            The template rendered without errors, but its output is empty.
          </v-alert>
          <pre v-else-if="testResult && testResult.ok" class="test-output">{{
            testResult.text
          }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="testDialog = false">Close</v-btn>
          <v-btn color="primary" :loading="testLoading" @click="runTest">
            Test
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import JSONField from "@/components/JSONField.vue"
export default {
  components: {
    ItemData,
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "Name",
          value: "name",
          input: "autocomplete",
          component: "v-combobox",
          url: "templates/list?show_all=true",
          errors: {
            'duplicate key value violates unique constraint "templates_user_id_key"':
              "This template already exists",
          },
          rules: ["required"],
        },
        {
          text: "Format",
          value: "format",
          input: "select",
          items: ["text", "html"],
          default: "text",
          help: "https://docs.bitcart.ai/guides/templates#html-templates",
        },
        {
          text: "Text",
          value: "text",
          input: "textarea",
          expand: true,
          help: "https://docs.bitcart.ai/bitcart-basics/walkthrough#templates",
          rules: ["required"],
        },
        { text: "Created date", value: "created", mode: "display" },
        {
          text: "Metadata",
          value: "metadata",
          input: "metadata",
          expand: true,
          component: JSONField,
        },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "templates",
      title: "Template",
      actions: [
        {
          icon: "mdi-play-circle-outline",
          text: "Test",
          process: this.openTest,
        },
      ],
      templateNames: [],
      testDialog: false,
      testTemplate: null,
      testName: null,
      testOwnerId: null,
      testResult: null,
      testError: "",
      testLoading: false,
    }
  },
  beforeMount() {
    this.$axios.get("/templates/list?show_all=true").then((r) => {
      this.templateNames = r.data.result
    })
  },
  methods: {
    openTest(item) {
      this.testTemplate = item
      this.testName = this.templateNames.includes(item.name) ? item.name : null
      this.testOwnerId = null
      this.testResult = null
      this.testError = ""
      this.testDialog = true
    },
    runTest() {
      this.testLoading = true
      this.testResult = null
      this.testError = ""
      this.$axios
        .post(`/templates/${this.testTemplate.id}/test`, {
          name: this.testName || null,
          owner_id: this.testOwnerId || null,
        })
        .then((r) => {
          this.testResult = r.data
        })
        .catch((e) => {
          const detail = e.response && e.response.data.detail
          this.testError =
            typeof detail === "string" ? detail : "Failed to test the template"
        })
        .finally(() => {
          this.testLoading = false
        })
    },
  },
}
</script>
<style scoped>
.test-output {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
