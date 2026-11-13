import "@/styles/globals.css";
import { useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/sonner";

const Assistant = dynamic(() => import("@/components/assistant/Assistant"), { ssr: false });

// Apple devices render SF Pro through the system stack; Inter is the fallback elsewhere.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    let onRoute;
    import("react-facebook-pixel").then(({ default: ReactPixel }) => {
      ReactPixel.init("5323417621055552");
      ReactPixel.pageView();
      onRoute = () => ReactPixel.pageView();
      router.events.on("routeChangeComplete", onRoute);
    });
    return () => onRoute && router.events.off("routeChangeComplete", onRoute);
  }, [router.events]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <MotionConfig reducedMotion="user">
        <Component {...pageProps} />
        <Assistant />
      </MotionConfig>
      <Toaster />
    </>
  );
}
