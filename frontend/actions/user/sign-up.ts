"use server";

import { redirect, RedirectType } from "next/navigation";
import "server-only";

export default async function signUp(currentErrors: string[], formData: FormData) {
  const email = formData.get("email")! as string;
  const password = formData.get("password")! as string;

  if (password.length < 6) {
    return ["Password must be at least 6 characters long"];
  }

  const response = await fetch(`${process.env.AUTH_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password,
    }),
    redirect: "manual",
  });

  if (response.status === 307) {
    return ["User with this email already exists. Please sign in instead."];
  }

  if (response.status !== 201) {
    return ["Registration error. Please try again later or contact support"];
  }

  redirect("/signin", RedirectType.replace);
}

