import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { NavBar, Footer } from "../components";

import { NFTProvider } from "../../context/NFTContext";

import "../../styles/globals.css"; // Import your global CSS file here

function MyApp({ Component, pageProps }) {
  return (
    <NFTProvider>
      <ThemeProvider attribute="class">
        <div className="dark:bg-nft-dark bg-white min-h-screen">
          <NavBar />
          <div className="pt-65">
            <Component {...pageProps} />
          </div>
          <Footer />
        </div>
        <Script
          src="https://kit.fontawesome.com/fe2522d3f8.js"
          crossorigin="anonymous"
        ></Script>
      </ThemeProvider>
    </NFTProvider>
  );
}

export default MyApp;
