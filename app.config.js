import 'dotenv/config';

export default {
  expo: {
    name: "DeliveCROUS",
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};