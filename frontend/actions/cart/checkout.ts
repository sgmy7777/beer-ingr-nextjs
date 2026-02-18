"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { cookies } from "next/headers";
import config from "@/types/config";

async function removeFromCart(id: string, all: boolean = false) {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return;
  }

  await fetch(`${process.env.AUTH_URL}${all ? "/cart/remove-all" : "/cart/remove-one"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      productID: id,
    }),
  });
}

async function addToCart(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return;
  }

  await fetch(`${process.env.AUTH_URL}/add-to-cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      productID: id,
    }),
  });
}

export default async function checkout(formData: FormData) {
  if (formData.get("descrease-amount") !== null) {
    removeFromCart(formData.get("descrease-amount") as string);
    revalidatePath("/cart");
    return;
  }

  if (formData.get("increase-amount") !== null) {
    addToCart(formData.get("increase-amount") as string);
    revalidatePath("/cart");
    return;
  }

  if (formData.get("remove-from-cart") !== null) {
    removeFromCart(formData.get("remove-from-cart") as string, true);
    revalidatePath("/cart");
    return;
  }

  if (formData.get("process-payment") !== null) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const cookieStore = await cookies();
    const token = cookieStore.get(config.AUTH_COOKIE_NAME)?.value;

    if (token) {
      await fetch(`${process.env.AUTH_URL}/cart/clear`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    }

    revalidatePath("/cart");
    redirect("/account", RedirectType.replace);
  }

  return;
}
