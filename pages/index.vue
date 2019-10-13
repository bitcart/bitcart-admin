<template>
  <v-container>
    <v-row>
      <v-col v-for="card in cards" :key="card.id">
        <InfoCard :texts="card.texts" :link="card.link" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <products-data />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import InfoCard from '@/components/InfoCard.vue'
import ProductsData from '@/components/ProductsData.vue'
export default {
  layout: 'dashboard',
  components: {
    InfoCard,
    ProductsData
  },
  data () {
    return {
      cards: [{
        texts: [{
          header: 'Wallets Balance',
          value: '0.00018474 BTC'
        },
        {
          header: 'Total wallets connected:',
          value: '1 wallets connected'
        }
        ],
        link: '/wallets'
      },
      {
        texts: [{
          header: 'Stores',
          value: '1'
        },
        {
          header: 'Total stores:',
          value: '1 stores created'
        }
        ],
        link: '/stores'
      },
      {
        texts: [{
          header: 'Total products',
          value: '4'
        },
        {
          header: 'Total products created:',
          value: '4 product in stores'
        }
        ],
        link: '/stores'
      }
      ]
    }
  }
}
</script>
