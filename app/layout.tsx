import "./globals.css";

export const metadata = {
  title: "Nexus Talenta Indonesia Academy",
  description: "Language learning and overseas career preparation platform by Nexus Talenta Indonesia.",
  icons: {
    icon: "/nexus-ai-logo.png",
    apple: "/nexus-ai-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
