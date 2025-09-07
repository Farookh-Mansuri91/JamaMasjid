import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Login page",
  description: "Login Page",
};

export default function RootLayout({ children }) {
  return <div className={inter.className}>{children}</div>; // ✅ No <html> or <body>
}
