import localFont from "next/font/local";
import "./globals.css";

const barlow = localFont({
  variable: "--font-barlow",
  display: "swap",
  preload: false,
  src: [
    {
      path: "../../public/fonts/Barlow/Barlow-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Barlow/Barlow-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

const hedvig = localFont({
  variable: "--font-hedvig",
  display: "swap",
  preload: false,
  src: [
    {
      path: "../../public/fonts/Hedvig_Letters_Serif/static/HedvigLettersSerif_18pt-Regular.ttf",
      weight: "400",
      style: "normal",
    },
  ],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${hedvig.variable} h-screen w-screen`}
    >
      <body>{children}</body>
    </html>
  );
}
