/**
 * Formato nombre propio: primera letra de cada palabra en mayúscula, el resto en minúscula.
 */
export function toProperCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
