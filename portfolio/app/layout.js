import { Plus_Jakarta_Sans } from "next/font/google";
import IntroLoader from "@/frontend/components/IntroLoader";
import MouseSpotlight from "@/frontend/components/MouseSpotlight";
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
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="bg-paper text-ink font-body antialiased">
        <IntroLoader />
        <MouseSpotlight />
        {children}
      </body>
    </html>
  );
}
