import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import LoadingScreen from "@/components/ui/LoadingScreen";
import FpsMeter from "@/components/ui/FpsMeter";

// Chrome for the public site. The Studio route (/studio) is outside this group,
// so it renders on the minimal root layout with no header/footer/smooth-scroll.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FpsMeter />
      <LoadingScreen />
      <CustomCursor />
      <Header />
      <SmoothScrollProvider>
        <main>{children}</main>
        <Footer />
      </SmoothScrollProvider>
    </>
  );
}
