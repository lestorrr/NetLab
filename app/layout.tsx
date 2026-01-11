import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'NetLab - Network Tools',
  description: 'Professional networking tools for educational and authorized use only.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container-page py-8">{children}</main>
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="container-page py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">N</span>
                </div>
                <span className="font-semibold text-gray-900">NetLab</span>
              </div>
              <p className="text-sm text-gray-500 text-center">
                For educational, authorized use only. Only scan or test hosts you own or have permission to test.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
