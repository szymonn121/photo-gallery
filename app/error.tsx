"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="container-shell grid min-h-[75svh] place-items-center pt-24 text-center"><div><p className="eyebrow mb-4">Błąd połączenia</p><h1 className="display text-5xl">Nie udało się załadować tej części galerii.</h1><p className="muted mx-auto mt-5 max-w-xl">Sprawdź połączenie z internetem lub konfigurację Supabase, a następnie spróbuj ponownie.</p><button className="button-primary mt-8" onClick={reset}>Spróbuj ponownie</button></div></div>;
}
