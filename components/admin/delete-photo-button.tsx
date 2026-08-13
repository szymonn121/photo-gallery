"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePhotoButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function remove() {
    setPending(true);
    const response = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
    setPending(false);
    if (!response.ok) return alert("Nie udało się usunąć fotografii.");
    setOpen(false);
    router.push("/admin/photos");
    router.refresh();
  }

  return (
    <>
      <button type="button" className="button-secondary button-danger" onClick={() => setOpen(true)}>Usuń fotografię</button>
      {open && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-photo-title" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <div className="editorial-panel w-full max-w-md p-6 sm:p-8">
            <p className="eyebrow mb-3">Operacja nieodwracalna</p>
            <h2 id="delete-photo-title" className="display text-4xl">Usunąć fotografię?</h2>
            <p className="muted mt-4 leading-7">„{title}” oraz oba pliki w Storage zostaną trwale usunięte.</p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button ref={cancelRef} type="button" className="button-secondary" onClick={() => setOpen(false)} disabled={pending}>Anuluj</button>
              <button type="button" className="button-primary bg-red-200 text-red-950 border-red-200" onClick={remove} disabled={pending}>{pending ? "Usuwanie..." : "Usuń na zawsze"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
