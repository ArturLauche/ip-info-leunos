/** Next.js page parameters may repeat; match URLSearchParams.get semantics. */
export type SearchParamValue = string | string[] | undefined;

export function firstSearchParam(value: SearchParamValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}
