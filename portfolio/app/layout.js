import { Plus_Jakarta_Sans } from "next/font/google";
import IntroLoader from "@/frontend/components/IntroLoader";
import DeferredLanguageSwitcher from "@/frontend/components/DeferredLanguageSwitcher";
import MouseSpotlight from "@/frontend/components/MouseSpotlight";
import ThemeSwitcher from "@/frontend/components/ThemeSwitcher";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Jay Szrs | Portfolio",
    template: "%s | Jay Szrs",
  },
  description:
    "Portofolio Jaelani Surya Saputra (jayszrs) — Informatics Engineer, Network Forensics Researcher, dan Web Developer.",
  applicationName: "Jay Szrs Portfolio",
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
