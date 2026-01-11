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
        <main className="container-page pt-8 pb-14">{children}</main>
        <footer className="border-t border-white/10">
          <div className="container-page py-10 text-sm text-white/70">
            For educational, authorized use only. Only scan or test hosts you own or have permission to test.
          </div>
        </footer>
      </body>
    </html>
  );
}
