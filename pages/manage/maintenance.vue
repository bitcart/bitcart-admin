<template>
  <div>
    <div v-for="command in commands" :key="command.title">
      <ManagementCommand
        :title="command.title"
        :details="command.details"
        :btn-text="command.btnText"
        :what="command.what"
        class="pb-3"
      />
    </div>
  </div>
</template>

<script>
import ManagementCommand from "@/components/ManagementCommand.vue"
export default {
  components: {
    ManagementCommand,
  },
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      commands: this.$utils.getExtendSetting.call(
        this,
        "maintenance_commands",
        [
          {
            title: "Update the server",
            details:
              "Updating your Bitcart instance will make it unavailable for some time. When clicked, page won't automatically reload on successful update.",
            btnText: "Start update process",
            what: "update",
          },
          {
            title: "Restart the server",
            details:
              "Restarting your Bitcart instance will make it unavailable for some time. It might fix some issues you are experiencing",
            btnText: "Start restart process",
            what: "restart",
          },
          {
            title: "Cleanup the server",
            details:
              "Free up server disk space by deleting unused docker images and logs of Bitcart",
            btnText: "Start cleanup process",
            what: "cleanup",
          },
          {
            title: "Cleanup unused images",
            details:
              "Free up server disk space by deleting unused docker images",
            btnText: "Start cleanup process",
            what: "cleanup/images",
          },
          {
            title: "Cleanup logs",
            details: "Free up server disk space by deleting logs of Bitcart",
            btnText: "Start cleanup process",
            what: "cleanup/logs",
          },
        ]
      ),
    }
  },
}
</script>
