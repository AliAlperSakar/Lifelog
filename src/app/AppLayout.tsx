import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/nav/BottomNav'
import { SideNav } from '../components/nav/SideNav'
import { QuickLogSheet } from '../features/log/QuickLogSheet'
import { UpdateBanner } from './UpdateBanner'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh">
      <SideNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <UpdateBanner />
        <main className="safe-top mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <QuickLogSheet />
    </div>
  )
}
