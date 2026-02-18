import isSignedIn from "@/actions/user/is-signed-in";
import { redirect, RedirectType } from "next/navigation";
import SignUpForm from "./components/sign-up-form/sign-up-form";

export default async function Page({ searchParams }: PageProps<"/signup">) {
  const userIsSignedIn = await isSignedIn();

  if (userIsSignedIn) {
    redirect("/", RedirectType.replace);
  }

  const search = await searchParams;
  const returnTo = search.returnTo ?? "/";

  return <main className="auth-page-wrapper">
    <div className="auth-background">
      <img src="/img/background/pattern.jpg" alt="Background pattern" />
    </div>
    <div className="auth-form-container">
      <div className="auth-container auth-container--register">
        <div className="Legend">
          <h1 className="auth-title">Register</h1>
        </div>

        <SignUpForm>
          <input type="hidden" name="return-to" value={returnTo} />
        </SignUpForm>

        <p className="auth-switch">Already have an account? <a href="/signin">Sign in</a></p>
      </div>
    </div>
  </main>;
}

