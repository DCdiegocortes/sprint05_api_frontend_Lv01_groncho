import { Outlet } from 'react-router'
import Logo from '@/components/Logo.jsx'
import Sidebar from './Sidebar.jsx'
import TabBar from './TabBar.jsx'
import TopActions from './TopActions.jsx'

export default function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="mx-auto flex w-full max-w-[440px] items-center justify-between px-6 pt-[max(env(safe-area-inset-top),24px)] md:max-w-[768px] xl:max-w-none xl:px-12 xl:pt-10">
          <Logo size={20} className="xl:invisible" />
          <TopActions />
        </header>
        <main className="mx-auto w-full max-w-[440px] flex-1 px-6 pt-5 pb-[140px] md:max-w-[768px] xl:max-w-none xl:px-12 xl:pb-12">
          <Outlet />
        </main>
      </div>
      <TabBar />
    </div>
  )
}
