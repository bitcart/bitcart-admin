<template>
  <div>
    <div v-for="command in commands" :key="command.title">
      <ManagementCommand
        :title="command.title"
        :details="command.details"
        :btnText="command.btnText"
        :what="command.what"
        class="pb-3"
      />
    </div>
  </div>
</template>

<script>
import ManagementCommand from '@/components/ManagementCommand.vue'
export default {
  layout: 'admin',
  middleware: 'superuserOnly',
  components: {
    ManagementCommand
  },
  data () {
    return {
      commands: [
        {
          title: 'Update the server',
          details: "Updating your BitcartCC instance will make it unavailable for some time. When clicked, page won't automatically reload on successful update.",
          btnText: 'Start update process',
          what: 'update'
        },
        {
          title: 'Cleanup the server',
          details: 'Free up server disk space by deleting unused docker images',
          btnText: 'Start cleanup process',
          what: 'cleanup'
        }
      ]
    }
  }
}
</script>
