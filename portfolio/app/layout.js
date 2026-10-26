import localFont from "next/font/local";
import DeferredLanguageSwitcher from "@/frontend/components/DeferredLanguageSwitcher";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL as siteUrl, HOME_TITLE, HOME_DESCRIPTION, pageMetadata } from '@/frontend/lib/site-metadata';
import "./globals.css";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || "W6pK9aCg_aupJMDlP49RhpLpzgAU0oRG5PWw6V13KKE";
const siteName = "Jay Szrs Portfolio";
const personName = "Jaelani Surya Saputra";
const siteDescription = HOME_DESCRIPTION;

const jakarta = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  weight: "400 800",
  style: "normal",
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: HOME_TITLE,
    template: "%s | Jay Szrs",
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: personName, url: siteUrl }],
  creator: personName,
  publisher: personName,
  keywords: [
    "Jaelani",
    "Jaelani Surya Saputra",
    "Jay",
    "Jay Szrs",
    "jayszrs",
    "portfolio Jaelani",
    "portfolio Jay Szrs",
    "IT Infrastructure",
    "Web Developer",
    "pengembang web",
    "jasa pembuatan website",
    "jasa IT network",
    "jasa IT support",
    "IT Jakarta",
    "Web Developer Bekasi",
    "AI Engineer",
    "Software Engineer",
  ],
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Jaelani Surya Saputra | Jay Szrs Portfolio",
    description: siteDescription,
    siteName,
    locale: "id_ID",
    images: [
      {
        url: "/favicon-512.png",
        width: 512,
        height: 512,
        alt: "Logo Jay Szrs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaelani Surya Saputra | Jay Szrs Portfolio",
    description: siteDescription,
    images: ["/favicon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: {
    google: googleVerification,
  },
  ...pageMetadata('/', { title: HOME_TITLE, description: siteDescription }),
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-theme="dark" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#050506" />
      </head>
      <body className="bg-paper text-ink font-body antialiased">
        <DeferredLanguageSwitcher />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
