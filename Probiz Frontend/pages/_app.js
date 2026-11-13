// import 'tailwindcss/tailwind.css'
// import '../styles/globals.css'
// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// function MyApp({ Component, pageProps }) {
//   const router = useRouter();
//   useEffect(() => {
//     import("react-facebook-pixel")
//       .then((x) => x.default)
//       .then((ReactPixel) => {
//         ReactPixel.init("5323417621055552"); // facebookPixelId
//         ReactPixel.pageView();

//         router.events.on("routeChangeComplete", () => {
//           ReactPixel.pageView();
//         });
//       });
//   }, [router.events]);
//   useEffect(() => {
//     if (window.location.hostname !== "localhost") {
//       document.addEventListener(
//         "contextmenu",
//         function (e) {
//           e.preventDefault();
//         },
//         false
//       );
//     } else {
//       // console.log("Development Mode on");
//     }
//   }, []);

//   return (
//     <>
//       <Head>   
    
//       </Head>

//       <Component {...pageProps} />

     
//     </>
//   );
// }

// export default MyApp;

// ******** new code *********
// import 'tailwindcss/tailwind.css'
// import '../styles/globals.css'
// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import Head from "next/head";
// function MyApp({ Component, pageProps }) {
//   const router = useRouter();
//   useEffect(() => {
//     import("react-facebook-pixel")
//       .then((x) => x.default)
//       .then((ReactPixel) => {
//         ReactPixel.init("5323417621055552"); // facebookPixelId
//         ReactPixel.pageView();

//         router.events.on("routeChangeComplete", () => {
//           ReactPixel.pageView();
//         });
//       });
//   }, [router.events]);
//   useEffect(() => {
//     if (window.location.hostname !== "localhost") {
//       document.addEventListener(
//         "contextmenu",
//         function (e) {
//           e.preventDefault();
//         },
//         false
//       );
//     } else {
//       // console.log("Development Mode on");
//     }
//   }, []);

//   return (
//     <>
//       <Head>   
    
//       </Head>

//       <Component {...pageProps} />

     
//     </>
//   );
// }

// export default MyApp;
import 'tailwindcss/tailwind.css'
import '../styles/globals.css'
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Facebook Pixel Script
  useEffect(() => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init("5323417621055552"); 
        ReactPixel.pageView();

        router.events.on("routeChangeComplete", () => {
          ReactPixel.pageView();
        });
      });
  }, [router.events]);

  // Disable right-click on live site (not localhost)
  useEffect(() => {
    if (window.location.hostname !== "localhost") {
      document.addEventListener(
        "contextmenu",
        function (e) {
          e.preventDefault();
        },
        false
      );
    }
  }, []);

  return (
    <>
      <Head>
        {/* You can put meta tags here if needed */}
      </Head>

      {/* ⭐ Tawk.to Live Chat Script - Runs on ALL Pages */}
      <Script id="tawk-script" strategy="afterInteractive">
        {`
          var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
          (function () {
              var s1 = document.createElement("script"),
                  s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = "https://embed.tawk.to/69300072e038f8197ec12a14/1jbho3gk8";
              s1.charset = "UTF-8";
              s1.setAttribute("crossorigin", "*");
              s0.parentNode.insertBefore(s1, s0);
          })();
        `}
      </Script>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
