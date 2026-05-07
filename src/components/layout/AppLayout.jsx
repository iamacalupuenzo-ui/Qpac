import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout({
  children, title = 'QAPAQ', tabs, role, userName, onLogout,
  activeNav: extNav,    onNavigate: extNavigate,
  activeTab: extTab,    onTabChange: extTabChange,
  marketData, ops,
}) {
  const [intNav, setIntNav] = useState('dashboard')
  const [intTab, setIntTab] = useState(tabs?.[0]?.id ?? null)

  const activeNav     = extNav      !== undefined ? extNav      : intNav
  const handleNav     = extNavigate !== undefined ? extNavigate : setIntNav
  const activeTab     = extTab      !== undefined ? extTab      : intTab
  const handleTabChange = extTabChange !== undefined ? extTabChange : setIntTab

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar activeItem={activeNav} onNavigate={handleNav} role={role} />

      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 'var(--sidebar-w)' }}
      >
        <Header
          title={title}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          role={role}
          userName={userName}
          onLogout={onLogout}
          marketData={marketData}
          ops={ops}
        />

        <main
          className="flex-1 p-6"
          style={{ background: 'var(--color-surface-bg)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
