import './globals.css';
import Shell from '@/components/Shell';

export const metadata = {
  title: 'CRM Anti Custos',
  description: 'Pipeline de prospecção e clientes, mantido com /crm',
};
export const viewport = {
  themeColor: '#F3EEE6',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* As duas fontes que pintam a maior parte do cockpit (corpo e número
            de KPI) acima da dobra — preload só destas, o resto entra sob demanda. */}
        <link rel="preload" href="/fonts/librefranklin-400-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ibmplexmono-500-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
