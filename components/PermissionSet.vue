<template>
  <div>
    <div v-for="permission in selectivePermissions" :key="permission">
      <component
        :is="tag"
        v-if="freePermissions || check(permission)"
        rows="12"
      >
        <selective-permission
          :value="selectedBool[permission]"
          :all.sync="allSelected[permission]"
          :title="permission"
          :selective="truthy(selectiveProp[permission])"
          :custom-title="customTitles[permission]"
          :rules="rules"
          :strict="strict"
          @input="addPermission(permission, $event)"
        >
          <auto-complete
            v-model="selectedItems[permission]"
            :multiple="true"
            :url="permission"
            :display-prop="displayProp[permission] || 'name'"
          />
        </selective-permission>
      </component>
    </div>
  </div>
</template>

<script>
import permissions from "@/data/permissions.json"
import SelectivePermission from "@/components/SelectivePermission"
import AutoComplete from "@/components/AutoComplete"
export default {
  components: {
    SelectivePermission,
    AutoComplete,
  },
  props: {
    tag: {
      type: String,
      default: "div",
    },
    freePermissions: {
      type: Boolean,
      default: true,
    },
    strict: {
      type: Boolean,
      default: false,
    },
    permissionProp: {
      type: Array,
      default: () => {
        return []
      },
    },
    rules: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    const selectivePermissions = permissions
    const defaultBool = Object.assign(
      ...selectivePermissions.map((k, i) => ({ [k]: !this.freePermissions }))
    )
    return {
      selectivePermissions,
      displayProp: this.$utils.getExtendSetting.call(
        this,
        "permission_set_display_prop",
        {
          invoices: "id",
          payouts: "id",
          files: "id",
        }
      ),
      permissions: new Set(),
      selectedItems: {},
      selectedBool: Object.assign({}, defaultBool),
      defaultBool,
      allSelected: {},
      selectiveProp: {
        server: false,
        full_control: false,
        token: false,
      },
      customTitles: this.$utils.getExtendSetting.call(
        this,
        "permission_set_custom_titles",
        {
          server: "The app will have full control on your server.",
          full_control:
            "Make the app access everything in your account, all current and further permissions included.",
          token:
            "The app will be able to list, modify and delete all your API keys.",
        }
      ),
    }
  },
  mounted() {
    for (const permission of this.selectivePermissions) {
      if (this.check(permission)) {
        this.permissions.add(permission)
      }
    }
  },
  methods: {
    addPermission(permission, value) {
      this.selectedBool[permission] = value
      if (value) {
        this.permissions.add(permission)
      } else {
        this.permissions.delete(permission)
      }
    },
    editAll(permission, value) {
      this.allSelected[permission] = value
    },
    postprocess(data) {
      const permissions = []
      for (const permission of this.permissions) {
        let permissionName
        if (permission === "server" || permission === "token") {
          permissionName = `${permission}_management`
        } else if (permission === "full_control") {
          permissionName = permission
        } else {
          permissionName = `${permission.slice(0, -1)}_management`
        }
        let allSelected = this.allSelected[permission]
        if (typeof allSelected === "undefined") {
          allSelected = true
        }
        if (!allSelected && this.selectedItems[permission]) {
          for (const item of this.selectedItems[permission]) {
            permissions.push(`${permissionName}:${item}`)
          }
        } else {
          permissions.push(permissionName)
        }
      }
      data.permissions = permissions
      return data
    },
    postclose() {
      this.selectedItems = {}
      this.allSelected = {}
      this.selectedBool = Object.assign({}, this.defaultBool)
      this.permissions = new Set()
    },
    truthy(val) {
      return typeof val === "undefined" ? true : val
    },
    check(val) {
      if (val !== "server" && val !== "token" && val !== "full_control") {
        val = val.slice(0, -1)
      }
      if (val !== "full_control") {
        val = `${val}_management`
      }
      return this.permissionProp.includes(val)
    },
  },
}
</script>
