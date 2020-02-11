<template>
  <Default>
    <Toolbar />
    <v-row>
      <v-col v-for="card in cards" :key="card.id">
        <InfoCard :texts="card.texts" :link="card.link" />
      </v-col>
    </v-row>
    <slot />
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
          key: 'balance',
          balance: true,
          value: ''
        },
        {
          header: 'Total wallets connected:',
          key: 'wallets',
          value: 'wallets connected'
        }
        ],
        link: '/wallets'
      },
      {
        texts: [{
          header: 'Stores',
          key: 'stores',
          value: ''
        },
        {
          header: 'Total stores:',
          key: 'stores',
          value: `stores created`
        }
        ],
        link: '/stores'
      },
      {
        texts: [{
          header: 'Discounts',
          key: 'discounts',
          value: ''
        },
        {
          header: 'Total discounts:',
          key: 'discounts',
          value: `discounts created`
        }
        ],
        link: '/discounts'
      },
      {
        texts: [{
          header: 'Total products',
          key: 'products',
          value: ''
        },
        {
          header: 'Total products created:',
          key: 'products',
          value: 'product in stores'
        }
        ],
        link: '/products'
      },
      {
        texts: [{
          header: 'Total invoices',
          key: 'invoices',
          value: ''
        },
        {
          header: 'Total invoices created:',
          key: 'invoices',
          value: 'invoices in stores'
        }
        ],
        link: '/invoices'
      }
      ]
    }
  },
  beforeCreate () {
    this.$store.dispatch('syncStats')
  }
}
</script>
