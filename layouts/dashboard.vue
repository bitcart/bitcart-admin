<template>
  <Basicadmin>
    <v-row>
      <v-col v-for="card in cards" :key="card.id" md="3" cols="12">
        <InfoCard :texts="card.texts" :link="card.link" />
      </v-col>
    </v-row>
    <slot />
  </Basicadmin>
</template>
<script>
import Basicadmin from '@/layouts/basicadmin'
import InfoCard from '@/components/InfoCard'
export default {
  components: {
    Basicadmin,
    InfoCard
  },
  data () {
    return {
      cards: [{
        texts: [{
          header: 'Wallets Balance',
          key: 'balance',
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
          header: 'Notifications',
          key: 'notifications',
          value: ''
        },
        {
          header: 'Total notifications:',
          key: 'notifications',
          value: 'notifications created'
        }
        ],
        link: '/notifications'
      },
      {
        texts: [{
          header: 'Templates',
          key: 'templates',
          value: ''
        },
        {
          header: 'Total templates:',
          key: 'templates',
          value: 'templates created'
        }
        ],
        link: '/templates'
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
          value: 'stores created'
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
          value: 'discounts created'
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
    if (process.client) { this.$store.dispatch('syncStats') }
  }
}
</script>
