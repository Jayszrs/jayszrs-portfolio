import { Plus_Jakarta_Sans } from "next/font/google";
import IntroLoader from "@/frontend/components/IntroLoader";
import DeferredLanguageSwitcher from "@/frontend/components/DeferredLanguageSwitcher";
import MouseSpotlight from "@/frontend/components/MouseSpotlight";
import ThemeSwitcher from "@/frontend/components/ThemeSwitcher";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jayszrs.my.id";
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || "W6pK9aCg_aupJMDlP49RhpLpzgAU0oRG5PWw6V13KKE";
const siteName = "Jay Szrs Portfolio";
const personName = "Jaelani Surya Saputra";
const siteDescription =
  "Portfolio resmi Jaelani Surya Saputra, dikenal sebagai Jay Szrs atau jayszrs, untuk IT infrastructure, web development, AI engineer, software engineering, dan dokumentasi proyek.";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jaelani Surya Saputra | Jay Szrs Portfolio",
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
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/favicon-192.png", sizes: "192x192", type: "image/png" }],
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
  },
  verification: {
    google: googleVerification,
  },
};

export default function RootLayout({ children }) {
  const themeScript = `
    (() => {
      try {
        const preference = localStorage.getItem("portfolio-theme") || "system";
        const systemDark = matchMedia("(prefers-color-scheme: dark)").matches;
        const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;
        document.documentElement.dataset.theme = resolved;
        document.documentElement.dataset.themePreference = preference;
      } catch (_) {}
    })();
  `;

  return (
    <html lang="id" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content={googleVerification} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-paper text-ink font-body antialiased">
        <IntroLoader />
        <MouseSpotlight />
        <DeferredLanguageSwitcher />
        <ThemeSwitcher />
        {children}
      </body>
    </html>
  );
}
