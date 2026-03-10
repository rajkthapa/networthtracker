import { LandingNavbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      {children}
      <Footer />
    </>
  );
}
