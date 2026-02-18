"use client";

import { useState, useTransition } from "react";

interface AddToCartProps {
  productID: string;
  initialAmount: number;
}

type UpdateAction = "add" | "removeOne" | "removeAll";

export default function AddToCart({ productID, initialAmount }: AddToCartProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [isPending, startTransition] = useTransition();

  const updateCart = (action: UpdateAction) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/cart/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productID,
            action,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json() as {
          totalCount: number;
          productAmount: number;
        };

        setAmount(data.productAmount);

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("cart:updated", {
            detail: {
              totalCount: data.totalCount,
              productID,
              productAmount: data.productAmount,
            },
          }));
        }
      } catch {
        // Ignore errors for now
      }
    });
  };

  if (amount <= 0) {
    return (
      <button
        type="button"
        name="add-product"
        value={productID}
        className="button button--primary add-to-cart-button"
        id="add-to-cart-btn"
        onClick={() => updateCart("add")}
        disabled={isPending}
      >
        <i className="fa-solid fa-cart-shopping"></i>
        <span>Add to Cart</span>
      </button>
    );
  }

  return (
    <div className="quantity-counter" id="quantity-counter">
      <button
        className="quantity-btn"
        data-action="decrease"
        aria-label="Decrease quantity"
        type="button"
        onClick={() => updateCart("removeOne")}
        disabled={isPending || amount <= 0}
      >
        <i className="fa-solid fa-minus"></i>
      </button>
      <span className="quantity-value">{amount} in cart</span>
      <button
        className="quantity-btn"
        data-action="increase"
        aria-label="Increase quantity"
        type="button"
        onClick={() => updateCart("add")}
        disabled={isPending}
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
}

