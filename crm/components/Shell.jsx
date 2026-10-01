'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// A skill /crm adiciona itens aqui conforme as telas que o SPEC pedir.
const NAV = [
  { href: '/', label: 'Cockpit', ic: '◆' },
  { href: '/pipeline', label: 'Pipeline', ic: '▤' },
];

export default function Shell({ children }) {
  const path = usePathname() || '/';
  if (path === '/login') return children;
  const isOn = (href) => (href === '/' ? path === '/' : path.startsWith(href));
  const title = (NAV.find((n) => isOn(n.href)) || { label: 'CRM' }).label;

  return (
    <div className="crm-root">
      <aside className="crm-side">
        <div className="crm-brand"><span className="di">◆</span> CRM Anti Custos</div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={'nav-item' + (isOn(n.href) ? ' on' : '')}>
            <span>{n.ic}</span> {n.label}
          </Link>
        ))}
      </aside>
      <div className="crm-main">
        <div className="crm-top"><span className="microcaps">{title}</span></div>
        {children}
      </div>
      <nav className="crm-bott">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={isOn(n.href) ? 'on' : ''}>
            <span>{n.ic}</span>{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
