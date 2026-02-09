const DEV_BASE_URL = "http://192.168.0.181:9090";
const PROD_BASE_URL = "https://freeman-humourless-blockishly.ngrok-free.dev";
// const PROD_BASE_URL = "https://freeman-humourless-blockishly.ngrok-free.dev";

export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;