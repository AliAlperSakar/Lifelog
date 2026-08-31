import { useState } from 'react'
import type { LogEntryOfCategory } from '../../../domain/types'
import { TextArea } from '../../../components/ui/Field'
import { TimestampField } from '../TimestampField'
import { toDateTimeLocalValue, fromDateTimeLocalValue } from '../../../utils/date'
import { defaultTimestamp, type FormProps } from './formShared'

type NoteEntry = LogEntryOfCategory<'note'>

export function NoteForm({ entry, formId, onSubmit }: FormProps<NoteEntry>) {
  const [when, setWhen] = useState(entry ? toDateTimeLocalValue(entry.timestamp) : toDateTimeLocalValue(defaultTimestamp()))
  const [text, setText] = useState(entry?.detail.text ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    onSubmit({ category: 'note', timestamp: fromDateTimeLocalValue(when), title: 'Note', detail: { text: text.trim() } })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TimestampField value={when} onChange={setWhen} />
      <TextArea label="Note" id="note-text" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Anything worth remembering about today…" required />
    </form>
  )
}
