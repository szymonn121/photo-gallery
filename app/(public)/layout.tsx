import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { OfflineNotice } from "@/components/site/offline-notice";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <OfflineNotice />
    </>
  );
}
