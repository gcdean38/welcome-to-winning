import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import Providers from "../components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Blue Liberty Analytics - Political Consulting",
  description: "Advanced analytics consulting for political campaigns.",
  icons: {
    icon: "/blue_liberty_favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Standard favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Optional high-res versions */}
        <link rel="icon" type="image/png" href="/blue_liberty_favicon.png" />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/blue_liberty_favicon.png" />

        {/* ✅ JSON-LD structured data for Google logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Blue Liberty Analytics",
              "url": "https://bluelibertyanalytics.com",
              "logo": "https://bluelibertyanalytics.com/blue_liberty_favicon.png",
            }),
          }}
        />
      </head>

      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
