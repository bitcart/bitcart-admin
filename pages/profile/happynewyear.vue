<template>
  <div>
    <v-card>
      <v-card-title>Merry Christmas and a Happy New Year!</v-card-title>
      <v-card-text
        >You have found the easter egg! Congratulations!
        <br />
        Merry Christmas and a Happy New Year! We wish you to spend these
        holidays with pleasure, and we want that, in 2022, we all have a better
        time. All the best in the coming year!
        <br />
        We, the BitcartCC team, will continue improving BitcartCC by listening
        to your feedback and ideas!
        <br />
        We always love hearing new opinions from you, so, if you have something
        to say, let us know in our telegram group!
        <br />
        Have a good day!
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-card-subtitle>Your BitcartCC Team</v-card-subtitle>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
export default {
  layout: "profile",
  mounted() {
    this.$store.commit("showSnow", true)
  },
}
</script>
