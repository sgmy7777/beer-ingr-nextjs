"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CartIconProps {
  initialCount: number;
}

interface CartUpdatedDetail {
  totalCount: number;
  productID?: string;
  productAmount?: number;
}

export default function CartIcon({ initialCount }: CartIconProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<CartUpdatedDetail>;
      if (customEvent.detail && typeof customEvent.detail.totalCount === "number") {
        setCount(customEvent.detail.totalCount);
      }
    };

    window.addEventListener("cart:updated", handler as EventListener);

    return () => {
      window.removeEventListener("cart:updated", handler as EventListener);
    };
  }, []);

  return (
    <Link href="/cart" className="cart-icon" aria-label="Shopping Cart">
      <img src="/img/icons/Shopping_bag.svg" alt="Shopping Cart" />
      {count > 0
        ? <span className="cart-badge">{count}</span>
        : null}
    </Link>
  );
}

