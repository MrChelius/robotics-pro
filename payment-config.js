window.CCCTradePayments = Object.freeze({
  currency: 'RUB',
  successUrl: 'https://mrchelius.github.io/robotics-pro/?payment=success',
  cancelUrl: 'https://mrchelius.github.io/robotics-pro/?payment=cancel',
  methods: {
    alipayChina: {
      label: 'Alipay China',
      type: 'hosted',
      checkoutUrl: '',
      note: 'Chinese mainland Alipay merchant checkout'
    },
    unionPay: {
      label: 'UnionPay',
      type: 'hosted',
      checkoutUrl: '',
      note: 'UnionPay hosted merchant checkout'
    },
    visa: {
      label: 'Visa',
      type: 'hosted',
      checkoutUrl: '',
      note: 'Card payment via PCI-compliant payment provider'
    },
    mastercard: {
      label: 'Mastercard',
      type: 'hosted',
      checkoutUrl: '',
      note: 'Card payment via PCI-compliant payment provider'
    },
    mir: {
      label: 'MIR',
      type: 'hosted',
      checkoutUrl: '',
      note: 'MIR payment via supported acquiring provider'
    }
  }
});
