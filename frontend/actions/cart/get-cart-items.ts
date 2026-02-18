"use server";

import "server-only";
import { CartItem } from "@/types/cart";
import { cookies } from "next/headers";
import config from "@/types/config";

export default async function getCartItems() {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return [] as CartItem[];
  }

  const cartItemsResponse = await fetch(`${process.env.AUTH_URL}/cart`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (cartItemsResponse.status !== 200) {
    return [] as CartItem[];
  }

  const data = await cartItemsResponse.json() as CartItem[];
  return data;
}
