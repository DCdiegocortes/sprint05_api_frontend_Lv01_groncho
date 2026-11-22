import { Outlet } from 'react-router'
import Logo from '@/components/Logo.jsx'
import Sidebar from './Sidebar.jsx'
import TabBar from './TabBar.jsx'
import TopActions from './TopActions.jsx'

export default function AppShell() {
  return (
    <div data-app-shell className="flex min-h-dvh">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="mx-auto flex w-full max-w-[440px] items-center justify-between px-6 pt-[max(env(safe-area-inset-top),24px)] md:max-w-[768px] xl:absolute xl:top-10 xl:right-12 xl:z-10 xl:mx-0 xl:w-auto xl:max-w-none xl:p-0">
          <Logo size={20} className="xl:hidden" />
          <TopActions />
        </header>
        <main className="mx-auto w-full max-w-[440px] flex-1 px-6 pt-5 pb-[140px] md:max-w-[768px] xl:max-w-none xl:px-12 xl:pt-9 xl:pb-12">
          <Outlet />
        </main>
      </div>
      <TabBar />
    </div>
  )
}
