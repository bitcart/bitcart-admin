<template>
  <InfoCard :texts="card.texts" :link="card.link" />
</template>

<script>
import InfoCard from "@/components/InfoCard"
export default {
  components: {
    InfoCard,
  },
  data() {
    return {
      card: {
        texts: [
          {
            header: "New page",
            key: "notifications",
            value: "",
          },
          {
            header: "Total stat:",
            key: "notifications",
            value: "stats created",
          },
        ],
        link: "/notifications",
      },
    }
  },
}
</script>
