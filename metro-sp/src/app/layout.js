import "./globals.css";

export const metadata = {
  title: "Meu App",
  description: "Aplicação Next.js com Tailwind",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
