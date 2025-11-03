import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./component/common/Header";
import Footer from "./component/common/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Noori Masjid",
  description: "Donation App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
