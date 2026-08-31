import {
  Apple,
  Cigarette,
  Cookie,
  CupSoda,
  Droplet,
  Flame,
  Footprints,
  Leaf,
  Martini,
  Moon,
  NotebookPen,
  Scale,
  Smile,
  Stethoscope,
  Dumbbell,
  PersonStanding,
  type LucideIcon,
} from 'lucide-react'
import type { LogCategory } from './types'

export interface CategoryMeta {
  label: string
  icon: LucideIcon
  color: string
}

export const CATEGORY_META: Record<LogCategory, CategoryMeta> = {
  food: { label: 'Food', icon: Apple, color: 'var(--color-cat-food)' },
  drink: { label: 'Drink', icon: CupSoda, color: 'var(--color-cat-drink)' },
  water: { label: 'Water', icon: Droplet, color: 'var(--color-cat-water)' },
  activity: { label: 'Activity', icon: PersonStanding, color: 'var(--color-cat-activity)' },
  running: { label: 'Running', icon: Footprints, color: 'var(--color-cat-activity)' },
  strength: { label: 'Strength', icon: Dumbbell, color: 'var(--color-cat-activity)' },
  steps: { label: 'Steps', icon: Footprints, color: 'var(--color-cat-activity)' },
  sleep: { label: 'Sleep', icon: Moon, color: 'var(--color-cat-sleep)' },
  nicotine: { label: 'Nicotine', icon: Cigarette, color: 'var(--color-cat-nicotine)' },
  cannabis: { label: 'Cannabis', icon: Leaf, color: 'var(--color-cat-cannabis)' },
  alcohol: { label: 'Alcohol', icon: Martini, color: 'var(--color-cat-alcohol)' },
  subjective: { label: 'Feeling', icon: Smile, color: 'var(--color-cat-subjective)' },
  symptom: { label: 'Symptom', icon: Stethoscope, color: 'var(--color-cat-symptom)' },
  weight: { label: 'Weight', icon: Scale, color: 'var(--color-cat-body)' },
  note: { label: 'Note', icon: NotebookPen, color: 'var(--color-cat-note)' },
}

export const DRINK_SUBTYPE_ICON: Partial<Record<string, LucideIcon>> = {
  coffee: CupSoda,
  tea: CupSoda,
  soda: CupSoda,
  energy_drink: Flame,
  juice: CupSoda,
  milk: CupSoda,
}

export const SUBJECTIVE_LABELS: Record<string, string> = {
  mood: 'Mood',
  energy: 'Energy',
  appetite: 'Appetite',
  concentration: 'Concentration',
  stress: 'Stress',
  wellbeing: 'Wellbeing',
}

export const NICOTINE_LABELS: Record<string, string> = {
  cigarette: 'Cigarette',
  vape: 'Vape',
  pouch: 'Nicotine pouch',
  other: 'Other',
}

export const SYMPTOM_LABELS: Record<string, string> = {
  headache: 'Headache',
  stomach: 'Stomach discomfort',
  nausea: 'Nausea',
  soreness: 'Soreness',
  knee: 'Knee discomfort',
  muscle: 'Muscle pain',
  fatigue: 'Fatigue',
  back: 'Back discomfort',
  other: 'Other',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  walking: 'Walking',
  mobility: 'Mobility',
  stretching: 'Stretching',
  cycling: 'Cycling',
  swimming: 'Swimming',
  physical_work: 'Physical work',
  other: 'Other',
}

export const FOOD_SUBTYPE_ICON = { meal: Apple, snack: Cookie }
