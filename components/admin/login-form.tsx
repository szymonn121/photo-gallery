"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  return (
    <form action={action} className="editorial-panel w-full max-w-md p-6 sm:p-8">
      <p className="eyebrow mb-4">Strefa prywatna</p>
      <h1 className="display text-4xl">Panel administratora</h1>
      <p className="muted mt-3 text-sm leading-6">Logowanie jest dostępne wyłącznie dla właściciela galerii.</p>
      <div className="mt-8 grid gap-5">
        <div className="field"><label htmlFor="email">E-mail</label><input className="input" id="email" name="email" type="email" autoComplete="username" required /></div>
        <div className="field"><label htmlFor="password">Hasło</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" minLength={8} required /></div>
        {state.error && <p role="alert" className="rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">{state.error}</p>}
        <button type="submit" className="button-primary" disabled={pending}>{pending ? "Logowanie..." : "Zaloguj się"}</button>
      </div>
    </form>
  );
}
