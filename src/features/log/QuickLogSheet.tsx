import { useState } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { useQuickLog } from '../../app/QuickLogContext'
import { Sheet } from '../../components/ui/Sheet'
import { Button } from '../../components/ui/Button'
import { IconButton } from '../../components/ui/IconButton'
import { logEntryRepository } from '../../repositories/logEntryRepository'
import { CategoryPicker, PICKER_ITEMS, type PickerItem } from './CategoryPicker'
import type { LogCategory } from '../../domain/types'
import type { NewEntryPayload } from './forms/formShared'

import { FoodForm } from './forms/FoodForm'
import { DrinkForm } from './forms/DrinkForm'
import { WaterForm } from './forms/WaterForm'
import { ActivityForm } from './forms/ActivityForm'
import { RunningForm } from './forms/RunningForm'
import { StrengthForm } from './forms/StrengthForm'
import { StepsForm } from './forms/StepsForm'
import { SleepForm } from './forms/SleepForm'
import { NicotineForm } from './forms/NicotineForm'
import { CannabisForm } from './forms/CannabisForm'
import { AlcoholForm } from './forms/AlcoholForm'
import { SubjectiveForm } from './forms/SubjectiveForm'
import { SymptomForm } from './forms/SymptomForm'
import { WeightForm } from './forms/WeightForm'
import { NoteForm } from './forms/NoteForm'

const FORM_ID = 'quicklog-form'

const CATEGORY_TITLES: Record<LogCategory, string> = {
  food: 'Food',
  drink: 'Drink',
  water: 'Water',
  activity: 'Activity',
  running: 'Running',
  strength: 'Strength',
  steps: 'Steps',
  sleep: 'Sleep',
  nicotine: 'Nicotine',
  cannabis: 'Cannabis',
  alcohol: 'Alcohol',
  subjective: 'Feeling',
  symptom: 'Symptom',
  weight: 'Weight',
  note: 'Note',
}

export function QuickLogSheet() {
  const { open, editingEntry, initialCategory, close } = useQuickLog()
  const [pickedItem, setPickedItem] = useState<PickerItem | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isEditing = Boolean(editingEntry)
  const activeCategory = editingEntry?.category ?? pickedItem?.category ?? initialCategory
  const activeSubtype = pickedItem?.subtype

  function handleClose() {
    setPickedItem(null)
    setConfirmingDelete(false)
    close()
  }

  async function handleSave(data: NewEntryPayload) {
    if (editingEntry) {
      await logEntryRepository.update(editingEntry.id, data)
    } else {
      await logEntryRepository.create(data)
    }
    handleClose()
  }

  async function handleDelete() {
    if (!editingEntry) return
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    await logEntryRepository.remove(editingEntry.id)
    handleClose()
  }

  function handlePick(item: PickerItem) {
    setPickedItem(item)
  }

  function handleBack() {
    setPickedItem(null)
  }

  const showPicker = !isEditing && !activeCategory

  const title = showPicker ? 'Log something' : `${isEditing ? 'Edit' : 'Log'} ${CATEGORY_TITLES[activeCategory!].toLowerCase()}`

  return (
    <Sheet open={open} onClose={handleClose} title={title} footer={!showPicker ? renderFooter() : undefined}>
      {showPicker && <CategoryPicker onPick={handlePick} />}
      {!showPicker && activeCategory && (
        <div className="flex flex-col gap-3">
          {!isEditing && (
            <button onClick={handleBack} className="tap-target -ml-1 flex w-fit items-center gap-1 text-sm font-medium text-[var(--color-ink-soft)]">
              <ArrowLeft size={15} /> Back
            </button>
          )}
          {renderForm()}
        </div>
      )}
    </Sheet>
  )

  function renderForm() {
    const category = activeCategory!
    const entry = editingEntry

    switch (category) {
      case 'food':
        return <FoodForm entry={entry && entry.category === 'food' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'drink':
        return <DrinkForm entry={entry && entry.category === 'drink' ? entry : undefined} defaultSubtype={activeSubtype} formId={FORM_ID} onSubmit={handleSave} />
      case 'water':
        return <WaterForm entry={entry && entry.category === 'water' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'activity':
        return <ActivityForm entry={entry && entry.category === 'activity' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'running':
        return <RunningForm entry={entry && entry.category === 'running' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'strength':
        return <StrengthForm entry={entry && entry.category === 'strength' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'steps':
        return <StepsForm entry={entry && entry.category === 'steps' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'sleep':
        return <SleepForm entry={entry && entry.category === 'sleep' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'nicotine':
        return <NicotineForm entry={entry && entry.category === 'nicotine' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'cannabis':
        return <CannabisForm entry={entry && entry.category === 'cannabis' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'alcohol':
        return <AlcoholForm entry={entry && entry.category === 'alcohol' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'subjective':
        return <SubjectiveForm entry={entry && entry.category === 'subjective' ? entry : undefined} defaultSubtype={activeSubtype} formId={FORM_ID} onSubmit={handleSave} />
      case 'symptom':
        return <SymptomForm entry={entry && entry.category === 'symptom' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'weight':
        return <WeightForm entry={entry && entry.category === 'weight' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      case 'note':
        return <NoteForm entry={entry && entry.category === 'note' ? entry : undefined} formId={FORM_ID} onSubmit={handleSave} />
      default:
        return null
    }
  }

  function renderFooter() {
    return (
      <div className="flex items-center gap-2">
        {isEditing && (
          <IconButton
            aria-label={confirmingDelete ? 'Confirm delete' : 'Delete entry'}
            onClick={() => void handleDelete()}
            className={confirmingDelete ? 'bg-[var(--color-alert)]/10 text-[var(--color-alert)]' : ''}
          >
            <Trash2 size={19} />
          </IconButton>
        )}
        {confirmingDelete && <span className="text-xs text-[var(--color-alert)]">Tap again to confirm</span>}
        <div className="flex-1" />
        <Button variant="secondary" type="button" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" form={FORM_ID}>
          Save
        </Button>
      </div>
    )
  }
}

// Re-exported so PICKER_ITEMS stays a single source of truth if other
// screens need to look up a category's display metadata.
export { PICKER_ITEMS }
