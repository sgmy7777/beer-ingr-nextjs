import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import config from "@/types/config";
import { CartItem } from "@/types/cart";

type UpdateAction = "add" | "removeOne" | "removeAll";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    productID?: string;
    action?: UpdateAction;
  };

  const productID = body.productID;
  const action = body.action;

  if (!productID || !action) {
    return NextResponse.json({ error: "productID and action are required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(config.AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authUrl = process.env.AUTH_URL;

  if (!authUrl) {
    return NextResponse.json({ error: "AUTH_URL is not configured" }, { status: 500 });
  }

  try {
    let targetPath = "";

    if (action === "add") {
      targetPath = "/add-to-cart";
    } else if (action === "removeOne") {
      targetPath = "/cart/remove-one";
    } else if (action === "removeAll") {
      targetPath = "/cart/remove-all";
    }

    if (targetPath === "") {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await fetch(`${authUrl}${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ productID }),
    });

    const cartResponse = await fetch(`${authUrl}/cart`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (cartResponse.status !== 200) {
      return NextResponse.json({
        totalCount: 0,
        productAmount: 0,
      } satisfies {
        totalCount: number;
        productAmount: number;
      }, { status: 200 });
    }

    const cartItems = await cartResponse.json() as CartItem[];
    const totalCount = cartItems.reduce((sum, item) => sum + item.amount, 0);
    const productAmount = cartItems.find((item) => item.id === productID)?.amount ?? 0;

    return NextResponse.json({
      totalCount,
      productAmount,
    } satisfies {
      totalCount: number;
      productAmount: number;
    }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

