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
    shortcut: "/blue_liberty_favicon.png",
    apple: "/blue_liberty_favicon.png",
  },
  openGraph: {
    title: "Blue Liberty Analytics - Political Consulting",
    description: "Advanced analytics consulting for political campaigns.",
    url: "https://www.bluelibertyanalytics.com",
    siteName: "Blue Liberty Analytics",
    images: [
      {
        url: "/logo.png", // 👈 create a square logo (>=112x112) in public/
        width: 512,
        height: 512,
        alt: "Blue Liberty Analytics Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blue Liberty Analytics - Political Consulting",
    description: "Advanced analytics consulting for political campaigns.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/blue_liberty_favicon.png" />
        <link rel="apple-touch-icon" href="/blue_liberty_favicon.png" />

        {/* ✅ JSON-LD Organization schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Blue Liberty Analytics",
              url: "https://www.bluelibertyanalytics.com",
              logo: "https://www.bluelibertyanalytics.com/logo.png", // 👈 full-size logo for Google
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
