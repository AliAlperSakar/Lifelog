import type { LogCategory } from '../domain/types'

/**
 * Future natural-language / voice logging architecture (see spec §46-48 and
 * docs/architecture.md). Not implemented in V1 — this module exists so the
 * rest of the app (a future "quick add from text" screen) can be built
 * against a stable interface today.
 *
 * Design boundary: a real implementation would call an LLM through a
 * backend/API proxy the user controls — never embed a provider API key in
 * this frontend bundle (see docs/architecture.md, "Future AI security").
 * `LocalMockNaturalLanguageLogParser` below is a placeholder that performs
 * no network access and no AI; it only demonstrates the shape of the
 * contract so the UI layer can be wired up ahead of a real parser.
 */

export interface ParsedLogEntryCandidate {
  category: LogCategory
  subtype?: string
  title: string
  /** 0-1, how confident the parser is that this candidate is correct. */
  confidence: number
  /** Loosely-typed candidate fields; the review UI maps these onto a real
   *  LogEntry detail object category-by-category before anything is saved. */
  fields: Record<string, unknown>
  sourceText: string
}

export interface NaturalLanguageLogParser {
  parse(input: string): Promise<ParsedLogEntryCandidate[]>
}

/** Always returns zero candidates and never calls out to a network. Useful
 * for wiring up the future "log from text" UI end-to-end (input → preview →
 * confirm) before a real parser exists, without shipping fake intelligence. */
export class LocalMockNaturalLanguageLogParser implements NaturalLanguageLogParser {
  async parse(_input: string): Promise<ParsedLogEntryCandidate[]> {
    return []
  }
}
