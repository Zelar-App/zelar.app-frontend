export type ClasseValor = string | number | false | null | undefined

/** Junta classes Tailwind ignorando valores falsy. */
export function cn(...classes: ClasseValor[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ')
}
