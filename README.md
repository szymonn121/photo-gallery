# Cinematic Photography Gallery

Kompletna galeria fotograficzna dla jednego autora: publiczna strona w ciepłej, filmowej estetyce oraz prywatny panel administratora oparty na Supabase.

## Stos

- Next.js 16.2.12 (App Router, Server Components, Route Handlers, `proxy.ts`)
- React 19.2.8 + TypeScript 6.0.3
- Tailwind CSS 4.3
- Motion for React 12
- Supabase Auth, Postgres, Storage i Row Level Security
- Leaflet + OpenStreetMap
- EXIFR do odczytywania metadanych zdjęć
- Zod do walidacji po stronie serwera

Wymagany jest Node.js 22.13 lub nowszy.

## Funkcje

### Publiczna strona

- pełnoekranowy hero z wyróżnioną fotografią i osobnym punktem kadrowania na desktop/mobile;
- responsywna galeria masonry bez wymuszania kadrowania;
- wyszukiwanie tytułu i opisu, filtrowanie kolekcji oraz sortowanie;
- stronicowanie przygotowane na setki fotografii;
- osobny adres URL dla każdego zdjęcia;
- pełnoekranowy viewer, zoom, strzałki lewo/prawo i Escape;
- dane techniczne, data publikacji, lokalizacja i mapa OSM;
- kolekcje i powiązane fotografie;
- Web Share API z kopiowaniem linku jako fallback;
- sitemap, robots.txt, canonical URL, generowane grafiki Open Graph/Twitter, metadane zdjęć i JSON-LD;
- custom 404, loading, error i komunikat offline;
- polski interfejs z wydzielonymi słownikami PL/EN;
- WCAG: semantyka, fokus, obsługa klawiatury i `prefers-reduced-motion`.

### Panel administratora

- logowanie e-mail + hasło bez publicznej rejestracji;
- dodatkowa autoryzacja przez tabelę `admin_users`;
- ograniczanie prób logowania w bazie;
- dashboard i liczniki;
- upload JPEG, PNG, WebP i AVIF do 40 MB;
- sprawdzanie MIME i sygnatury pliku;
- rzeczywisty pasek postępu uploadu;
- generowanie miniatury WebP i lekkiego placeholdera blur w przeglądarce;
- odczyt EXIF z możliwością ręcznej korekty;
- tworzenie, edycja, zastępowanie i usuwanie fotografii;
- szkice, publikacja z wybraną datą, pojedyncza fotografia wyróżniona i sterowanie kadrem hero;
- lokalizacja ręczna lub z EXIF;
- zarządzanie kolekcjami i okładkami;
- edycja tekstów strony, profili społecznościowych i opcjonalnego znaku wodnego.

## 1. Utwórz projekt Supabase

1. Załóż nowy projekt w Supabase.
2. Otwórz **SQL Editor**.
3. Wklej i uruchom cały plik:

```text
supabase/migrations/001_initial_schema.sql
```

Migracja tworzy tabele, indeksy, klucze obce, ograniczenia, triggery, polityki RLS, rate limiting i publiczny bucket `photos` z zabezpieczonym zapisem.

## 2. Utwórz pierwszego administratora

Publiczna rejestracja nie jest używana przez aplikację.

1. W Supabase przejdź do **Authentication → Users → Add user**.
2. Utwórz użytkownika e-mail + hasło i zaznacz automatyczne potwierdzenie e-maila.
3. W SQL Editor uruchom, podmieniając adres:

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('twoj-email@example.com')
on conflict (user_id) do nothing;
```

4. W **Authentication → Providers → Email** wyłącz możliwość samodzielnej rejestracji, jeżeli w projekcie jest włączona. Aplikacja i tak nie posiada ekranu rejestracji.

## 3. Zmienne środowiskowe

Skopiuj przykład:

```bash
cp .env.example .env.local
```

Uzupełnij:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Klucz publishable/anon może być używany w przeglądarce — bezpieczeństwo zapisu zapewniają sesja administratora i RLS. Klucz `service_role` nie jest potrzebny i nie powinien znaleźć się w projekcie frontendowym.

## 4. Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz:

- strona: `http://localhost:3000`
- panel: `http://localhost:3000/admin`

Dodatkowe kontrole:

```bash
npm run typecheck
npm run lint
npm run build
```

## 5. Prześlij pierwszą fotografię

1. Wejdź na `/admin` i zaloguj się kontem wpisanym do `admin_users`.
2. Opcjonalnie utwórz kolekcję w **Kolekcje**.
3. Kliknij **Dodaj fotografię**.
4. Wybierz plik. Miniatura, rozmiar i możliwe dane EXIF zostaną przygotowane automatycznie.
5. Uzupełnij tytuł, opis i tekst alternatywny.
6. Wybierz status **Opublikowane** i datę publikacji.
7. Zaznacz **Ustaw jako zdjęcie główne**, aby wykorzystać fotografię w hero strony głównej.
8. Zapisz. Po powodzeniu strona publiczna zostanie odświeżona przez rewalidację Next.js.

## 6. Wdrożenie produkcyjne

### Vercel

1. Umieść repozytorium na GitHubie.
2. Zaimportuj projekt do Vercel.
3. Dodaj trzy zmienne z `.env.local` w **Project Settings → Environment Variables**.
4. Ustaw `NEXT_PUBLIC_SITE_URL` na finalną domenę, np. `https://foto.example.com`.
5. Wdróż projekt.

### Inny hosting Node.js

```bash
npm install
npm run build
npm run start
```

Hosting musi obsługiwać Node.js 22.13+, zmienne środowiskowe i proces Next.js. Aplikacja nie wymaga lokalnego dysku do przechowywania zdjęć.

## Pełna struktura plików

Dokładne drzewo wszystkich plików projektu znajduje się w [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md).

## Architektura

```text
app/
  admin/                 prywatny panel i logowanie
  api/admin/             chronione operacje CRUD
  gallery/               lista i strony zdjęć
  collections/           lista i strony kolekcji
components/
  admin/                 formularze zarządzania
  gallery/               karty i układ zdjęć
  photo/                 viewer, mapa, udostępnianie
  site/                  hero, nawigacja, stopka
lib/
  admin/                 kontrola administratora i upload
  supabase/              klient server/browser/public i proxy sesji
  validation/            schematy Zod
  data.ts                publiczne, wydajne zapytania
supabase/migrations/     pełny schemat i RLS
```

Publiczne strony korzystają głównie z Server Components i ISR. Interaktywny JavaScript jest ograniczony do elementów, które go potrzebują: menu mobilnego, animacji, viewer, mapy, udostępniania i panelu uploadu. Obrazy są wyświetlane przez `next/image`, posiadają zapisane proporcje i placeholder blur, dzięki czemu nie powodują skoków układu.

## Bezpieczeństwo

- Publiczny odczyt jest ograniczony przez RLS do treści opublikowanych i daty `published_at <= now()`.
- Wszystkie zapisy wymagają zalogowanego użytkownika obecnego w `admin_users`.
- Route Handlers wykonują kontrolę administratora i walidują payload Zod.
- Storage akceptuje tylko dozwolone typy i maksymalnie 40 MB.
- Upload wymaga JWT administratora; publishable key sam nie daje prawa zapisu.
- Nazwy plików są zastępowane UUID i bezpiecznym slugiem.
- Next Server Actions używają ciasteczek `SameSite` i weryfikacji origin frameworka.
- Nie ma publicznej rejestracji, kont odwiedzających, komentarzy ani formularza kontaktowego.
- Komunikaty błędów nie ujawniają zapytań SQL ani danych wrażliwych.

## OpenStreetMap

Mapa korzysta z publicznych kafelków OSM i pokazuje wymagane przypisanie autorstwa. Przy dużym ruchu należy użyć własnego dostawcy kafelków zgodnego z zasadami OSM lub hostować kafelki samodzielnie. Kod mapy pozostaje bezkluczowy i można łatwo podmienić URL warstwy.

## Lista kontrolna

- [x] publiczna galeria, wyszukiwanie, filtry, sortowanie i paginacja
- [x] hero z kadrem desktop/mobile, ostatnie zdjęcia, kolekcje, About i stopka
- [x] osobne strony zdjęć i kolekcji
- [x] pełny ekran, zoom, klawiatura, share i nawigacja poprzednie/następne
- [x] opcjonalna lokalizacja, opis miejsca i dwie wielkości mapy
- [x] panel administratora i brak publicznej rejestracji
- [x] upload z postępem, podglądem, walidacją, miniaturą i EXIF
- [x] tworzenie, edycja, zastępowanie, ukrywanie/publikowanie i usuwanie
- [x] kolekcje, okładki, fotografia wyróżniona i znak wodny
- [x] Supabase schema, constraints, indexes, Storage i RLS
- [x] loading, empty, no results, error, offline i 404
- [x] SEO, sitemap, robots, OG, Twitter Cards i structured data
- [x] responsywność, safe areas, dostępność i reduced motion
- [x] `.env.example`, instrukcje lokalne, administrator i deployment
