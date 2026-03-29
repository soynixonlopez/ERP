import { z } from "zod";

/**
 * UUID almacenado en Postgres (patron 8-4-4-4-12 hex).
 * En Zod 4, `z.uuid()` exige RFC 4122 estricto y rechaza IDs seed como
 * `11111111-1111-1111-1111-111111111111` (variante invalida en RFC).
 */
export const zPgUuid = z.guid();
