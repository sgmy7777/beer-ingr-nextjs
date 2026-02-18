"use client";

import { PropsWithChildren, useActionState } from "react";
import PendingButton from "@/components/pending-button/pending-button";
import signUp from "@/actions/user/sign-up";

export default function SignUpForm({ children }: PropsWithChildren) {
  const [errors, signUpAction] = useActionState(signUp, [] as string[]);

  return <form className="auth-form" id="signup-form" action={signUpAction}>
    {children}

    {errors.length === 0
      ? null
      : <div className="ErrorContainer">{errors.map((e, i) => <p key={`error-${i}`}>{e}</p>)}</div>}

    <div className="InputField">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" className="Input" placeholder="Value" required />
    </div>
    <div className="InputField">
      <label htmlFor="password">Password</label>
      <input type="password" id="password" name="password" className="Input" placeholder="Value" required minLength={6} />
    </div>

    <div className="ButtonGroup">
      <PendingButton
        className="button button--primary"
        pendingText={<>Registering&hellip;</>}
      >Register</PendingButton>
    </div>
  </form>;
}

