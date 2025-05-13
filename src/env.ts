export function getEnvInt(name: string, required = true, def?: number): number {
  const val = process.env[name];
  if (val === undefined || val === "") {
    if (required) {
      console.error(`[ENV ERROR] ${name} is required but not set.`);
      throw new Error(`${name} is required`);
    }
    if (def !== undefined) {
      return def;
    }
    console.error(`[ENV ERROR] ${name} is not set and no default provided.`);
    throw new Error(`${name} is not set and no default provided`);
  }
  const n = Number(val);
  if (!Number.isInteger(n)) {
    console.error(`[ENV ERROR] ${name} must be an integer. Got: ${val}`);
    throw new Error(`${name} must be an integer`);
  }
  return n;
}

export function getEnvEnum<T extends string>(
  name: string,
  values: T[],
  def?: T,
): T {
  const val = process.env[name];
  if (!val) return def!;
  if (!values.includes(val as T)) {
    console.error(
      `[ENV ERROR] ${name} must be one of: ${values.join(", ")}. Got: ${val}`,
    );
    throw new Error(`${name} must be one of: ${values.join(", ")}`);
  }
  return val as T;
}

export function getEnvString(name: string, def?: string): string {
  const val = process.env[name];
  if (val === undefined || val === "") return def ?? "";
  return val;
}
