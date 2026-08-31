import {
  Apple,
  CupSoda,
  Droplet,
  PersonStanding,
  Footprints,
  Dumbbell,
  Moon,
  Coffee,
  Cigarette,
  Leaf,
  Martini,
  Smile,
  Zap,
  Utensils,
  Brain,
  Stethoscope,
  Scale,
  NotebookPen,
  type LucideIcon,
} from 'lucide-react'
import type { LogCategory, SubjectiveSubtype } from '../../domain/types'

export interface PickerItem {
  key: string
  label: string
  icon: LucideIcon
  category: LogCategory
  subtype?: string
}

export const PICKER_ITEMS: PickerItem[] = [
  { key: 'food', label: 'Food', icon: Apple, category: 'food' },
  { key: 'drink', label: 'Drink', icon: CupSoda, category: 'drink' },
  { key: 'water', label: 'Water', icon: Droplet, category: 'water' },
  { key: 'activity', label: 'Activity', icon: PersonStanding, category: 'activity' },
  { key: 'running', label: 'Running', icon: Footprints, category: 'running' },
  { key: 'strength', label: 'Strength', icon: Dumbbell, category: 'strength' },
  { key: 'steps', label: 'Steps', icon: Footprints, category: 'steps' },
  { key: 'sleep', label: 'Sleep', icon: Moon, category: 'sleep' },
  { key: 'caffeine', label: 'Caffeine', icon: Coffee, category: 'drink', subtype: 'coffee' },
  { key: 'nicotine', label: 'Nicotine', icon: Cigarette, category: 'nicotine' },
  { key: 'cannabis', label: 'Cannabis', icon: Leaf, category: 'cannabis' },
  { key: 'alcohol', label: 'Alcohol', icon: Martini, category: 'alcohol' },
  { key: 'mood', label: 'Mood', icon: Smile, category: 'subjective', subtype: 'mood' satisfies SubjectiveSubtype },
  { key: 'energy', label: 'Energy', icon: Zap, category: 'subjective', subtype: 'energy' satisfies SubjectiveSubtype },
  { key: 'appetite', label: 'Appetite', icon: Utensils, category: 'subjective', subtype: 'appetite' satisfies SubjectiveSubtype },
  { key: 'concentration', label: 'Focus', icon: Brain, category: 'subjective', subtype: 'concentration' satisfies SubjectiveSubtype },
  { key: 'symptom', label: 'Symptom', icon: Stethoscope, category: 'symptom' },
  { key: 'weight', label: 'Weight', icon: Scale, category: 'weight' },
  { key: 'note', label: 'Note', icon: NotebookPen, category: 'note' },
]

export function CategoryPicker({ onPick }: { onPick: (item: PickerItem) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {PICKER_ITEMS.map((item) => (
        <button
          key={item.key}
          onClick={() => onPick(item)}
          className="tap-target flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] py-4 text-center transition-colors hover:bg-[var(--color-brand-50)] active:scale-[0.97]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-50)] text-[var(--color-brand-600)]">
            <item.icon size={20} />
          </span>
          <span className="text-xs font-medium text-[var(--color-ink)]">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
