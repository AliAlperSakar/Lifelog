import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Scale, Settings, Target } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useLatestWeightEntry } from '../../hooks/useEntries'
import { profileRepository } from '../../repositories/profileRepository'
import { Card } from '../../components/ui/Card'
import { NumberInput, SelectInput } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { useQuickLog } from '../../app/QuickLogContext'
import { formatApprox } from '../../utils/format'
import { formatDayHeading } from '../../utils/date'
import type { ActivityLevel, Sex } from '../../domain/types'

export function ProfileScreen() {
  const profile = useProfile()
  const latestWeight = useLatestWeightEntry()
  const { openCreate } = useQuickLog()

  const [heightCm, setHeightCm] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex | ''>('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    setHeightCm(profile.heightCm?.toString() ?? '')
    setAge(profile.age?.toString() ?? '')
    setSex(profile.sex ?? '')
    setActivityLevel(profile.activityLevel ?? '')
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await profileRepository.update({
      heightCm: heightCm ? Number(heightCm) : undefined,
      age: age ? Number(age) : undefined,
      sex: sex || undefined,
      activityLevel: activityLevel || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const latestWeightEntry = latestWeight && latestWeight.category === 'weight' ? latestWeight : undefined
  const currentWeight = latestWeightEntry?.detail.weightKg ?? profile?.seedWeightKg
  const weightApproximate = latestWeightEntry ? latestWeightEntry.measurementStatus === 'approximate' : profile?.seedWeightApproximate

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-[var(--color-ink)]">Profile</h1>

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-info)]/10 text-[var(--color-info)]">
            <Scale size={20} />
          </span>
          <div>
            <p className="text-xs font-medium text-[var(--color-ink-soft)]">Current weight</p>
            <p className="text-lg font-semibold text-[var(--color-ink)]">
              {currentWeight !== undefined ? `${formatApprox(currentWeight, weightApproximate ? 'approximate' : 'exact', 1)} kg` : 'Not logged'}
            </p>
            {latestWeight && <p className="text-xs text-[var(--color-ink-faint)]">as of {formatDayHeading(latestWeight.localDate)}</p>}
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={() => openCreate('weight')}>
          Log weight
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/goals">
          <Card className="flex items-center justify-between hover:bg-[var(--color-surface-alt)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
                <Target size={18} />
              </span>
              <span className="font-medium text-[var(--color-ink)]">Goals</span>
            </div>
            <ChevronRight size={18} className="text-[var(--color-ink-faint)]" />
          </Card>
        </Link>
        <Link to="/settings">
          <Card className="flex items-center justify-between hover:bg-[var(--color-surface-alt)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-[var(--color-ink-soft)]">
                <Settings size={18} />
              </span>
              <span className="font-medium text-[var(--color-ink)]">Settings & backup</span>
            </div>
            <ChevronRight size={18} className="text-[var(--color-ink-faint)]" />
          </Card>
        </Link>
      </div>

      <Card>
        <form onSubmit={(e) => void handleSave(e)} className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">About you</h2>
          <p className="text-xs text-[var(--color-ink-faint)]">All optional — only used to make goals and reports more relevant to you.</p>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Height (cm)" id="profile-height" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min={0} step="any" />
            <NumberInput label="Age" id="profile-age" value={age} onChange={(e) => setAge(e.target.value)} min={0} step={1} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectInput label="Sex" value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </SelectInput>
            <SelectInput label="Activity level" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>
              <option value="">Not specified</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </SelectInput>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit">Save</Button>
            {saved && <span className="text-sm text-[var(--color-good)]">Saved</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}
