import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'NetLab By Jhnlstrlclcn',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Header />
        <main className="container-page mt-8">{children}</main>
        <footer className="mt-16">
          <div className="container-page text-sm text-white/70">
            For educational, authorized use only. Only scan or test hosts you own or have permission to test.
          </div>
        </footer>
      </body>
    </html>
  );
}
