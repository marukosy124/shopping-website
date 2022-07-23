import axios from 'axios';
import { BASE_URL } from '../constants';

const instance = axios.create({
  baseURL: BASE_URL,
});

// instance.defaults.headers.common['Access-Control-Allow-Origin'] = BASE_URL ?? '';

instance.interceptors.request.use(
  async (config) => {
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default instance;
