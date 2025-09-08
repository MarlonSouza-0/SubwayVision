import "./globals.css";


export const metadata = {
  title: "Metro-SP",
  description: "Sistema de login",
  icons: {
    icon: "assets/icon.png", // caminho relativo à pasta public
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}


