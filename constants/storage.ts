import * as SecureStore from "expo-secure-store";

export async function saveUser(user: any) {
  await SecureStore.setItemAsync("user", JSON.stringify(user));
}

export async function getUser() {
  const data = await SecureStore.getItemAsync("user");
  return data ? JSON.parse(data) : null;
}

export async function removeUser() {
  await SecureStore.deleteItemAsync("user");
}

export const formatNumber = (num: number)=> {
  if (num < 1000) return num.toString();
  if (num < 100000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1).replace(/\.0$/, "") + "k";
  if (num < 10000000) return (num / 100000).toFixed(num % 100000 === 0 ? 0 : 1).replace(/\.0$/, "") + "L";
  return (num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 1).replace(/\.0$/, "") + "Cr";
};
