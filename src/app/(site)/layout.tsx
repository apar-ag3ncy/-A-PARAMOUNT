import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Chrome for the public site. The Studio route (/studio) is outside this group,
// so it renders on the minimal root layout with no header/footer/smooth-scroll.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <Header />
      <SmoothScrollProvider>
        <main>{children}</main>
        <ConditionalFooter>
          <Footer />
        </ConditionalFooter>
      </SmoothScrollProvider>
    </>
  );
}
