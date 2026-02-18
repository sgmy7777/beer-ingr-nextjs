"use server";

import config from "@/types/config";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import "server-only";

export default async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(config.AUTH_COOKIE_NAME)?.value;

  if (token !== undefined) {
    try {
      await fetch(`${process.env.AUTH_URL}/signout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch {
      // Игнорируем ошибки логаута на бэкенде, всё равно очистим куки локально
    }
  }

  cookieStore.delete(config.AUTH_COOKIE_NAME);
  cookieStore.delete(config.AUTH_COOKIE_EXPIRATION_NAME);
  redirect("/", RedirectType.replace);
}
