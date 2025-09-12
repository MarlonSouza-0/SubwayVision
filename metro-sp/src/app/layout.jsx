import "./globals.css";
import { AuthProvider } from "@/shared/context/AuthContext";


export const metadata = {
  title: "Metro-SP",
  description: "Sistema de login",
  icons: {
    icon: "assets/icon.png", // caminho relativo à pasta public
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}


