export const BASE_URL = process.env.REACT_APP_NODE_ENV === 'production' ? process.env.REACT_APP_PROD_BASE_URL : process.env.REACT_APP_DEV_BASE_URL;

export const PAYPAL_OPTIONS = {
  'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID ?? 'test',
  currency: 'HKD',
  components: 'buttons',
};

export const PAGE_EXCEPTION = ['change-password', 'payment', 'order'];
