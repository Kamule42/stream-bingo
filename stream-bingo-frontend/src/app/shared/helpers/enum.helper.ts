export const enumFromStringValue = <T>(enm: { [s: string]: T}, value: string | null): T | null => {
    return value != null && (Object.values(enm) as unknown as string[]).includes(value)
      ? value as unknown as T
      : null;
}
