/**
 * Safe authentication token validation and header formatting
 * Prevents invalid header characters and ByteString/DOMException pattern errors
 */
export const sanitizeToken = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, '');
  if (!cleaned || cleaned === 'null' || cleaned === 'undefined') return null;
  // Valid token format: ASCII printable without control chars or whitespace
  if (!/^[\x21-\x7E]+$/.test(cleaned)) return null;
  return cleaned;
};

export const getAuthHeaders = (token: unknown): Record<string, string> => {
  const clean = sanitizeToken(token);
  return clean ? { Authorization: `Bearer ${clean}` } : {};
};
