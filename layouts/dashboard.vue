<template>
  <Default>
    <Toolbar />
    <v-row>
      <v-col v-for="card in cards" :key="card.id">
        <InfoCard :texts="card.texts" :link="card.link" />
      </v-col>
    </v-row>
  </Default>
</template>
<script>
import Default from '@/layouts/default'
import Toolbar from '@/components/Toolbar'
import InfoCard from '@/components/InfoCard'
export default {
  components: {
    Default,
    Toolbar,
    InfoCard
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
        link: '/products'
      }
      ]
    }
  }
}
</script>
