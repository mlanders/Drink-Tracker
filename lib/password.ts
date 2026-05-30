export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const hashBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  const combined = new Uint8Array(salt.length + hashBits.byteLength);
  combined.set(salt);
  combined.set(new Uint8Array(hashBits), salt.length);
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const hashBits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      256,
    );
    const hashBytes = new Uint8Array(hashBits);
    if (hashBytes.length !== storedHash.length) return false;
    return hashBytes.every((byte, i) => byte === storedHash[i]);
  } catch {
    return false;
  }
}
