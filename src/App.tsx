import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/AppLayout'
import { TodayScreen } from './features/today/TodayScreen'
import { HistoryScreen } from './features/history/HistoryScreen'
import { ProfileScreen } from './features/profile/ProfileScreen'
import { GoalsScreen } from './features/profile/GoalsScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { DailyReportScreen } from './features/reports/DailyReportScreen'
import { NotFoundScreen } from './features/NotFoundScreen'

// Trends pulls in Recharts, by far the heaviest dependency in the app —
// code-split it so the initial load (Today, the screen opened most often)
// doesn't pay for a charting library it doesn't use.
const TrendsScreen = lazy(() => import('./features/trends/TrendsScreen').then((m) => ({ default: m.TrendsScreen })))

function ScreenFallback() {
  return <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<TodayScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route
          path="/trends"
          element={
            <Suspense fallback={<ScreenFallback />}>
              <TrendsScreen />
            </Suspense>
          }
        />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/goals" element={<GoalsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/report/:date" element={<DailyReportScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}
