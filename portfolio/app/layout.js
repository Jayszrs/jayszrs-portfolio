import { Plus_Jakarta_Sans } from "next/font/google";
import IntroLoader from "@/frontend/components/IntroLoader";
import DeferredLanguageSwitcher from "@/frontend/components/DeferredLanguageSwitcher";
import MouseSpotlight from "@/frontend/components/MouseSpotlight";
import ThemeSwitcher from "@/frontend/components/ThemeSwitcher";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.jayszrs.my.id";
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || "W6pK9aCg_aupJMDlP49RhpLpzgAU0oRG5PWw6V13KKE";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jay Szrs | Portfolio",
    template: "%s | Jay Szrs",
  },
  description:
    "Portofolio Jaelani Surya Saputra (jayszrs) — Informatics Engineer, Network Forensics Researcher, dan Web Developer.",
  applicationName: "Jay Szrs Portfolio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Jay Szrs | Portfolio",
    description:
      "Portofolio Jaelani Surya Saputra (jayszrs) - Informatics Engineer, Network Forensics Researcher, dan Web Developer.",
    siteName: "Jay Szrs Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jay Szrs | Portfolio",
    description:
      "Portofolio Jaelani Surya Saputra (jayszrs) - Informatics Engineer, Network Forensics Researcher, dan Web Developer.",
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
