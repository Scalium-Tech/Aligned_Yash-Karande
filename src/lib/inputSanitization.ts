/**
 * Input Sanitization Utilities
 * 
 * APPROACH: Allowlist-based sanitization
 * Instead of trying to block known attack patterns (which attackers bypass),
 * we ONLY ALLOW known-safe character classes and patterns.
 * 
 * KEY PRINCIPLE: React already escapes JSX content for XSS protection.
 * We do NOT HTML-encode data before storing it - that causes double-encoding.
 * Instead, we:
 * 1. Validate input matches expected patterns (allowlist)
 * 2. Remove genuinely dangerous characters (control chars, unicode shenanigans)
 * 3. Truncate to prevent DoS
 * 4. Let React handle XSS protection at render time
 * 
 * SQL injection is handled by Supabase's parameterized queries.
 */

// ============================================
// CONFIGURATION
// ============================================

/** Maximum allowed length for habit text input */
export const MAX_HABIT_INPUT_LENGTH = 500;

/** Maximum allowed length for any user identity field */
export const MAX_IDENTITY_FIELD_LENGTH = 2000;

/** Maximum total characters allowed from user input parsing */
export const MAX_TOTAL_INPUT_LENGTH = 10000;

/**
 * Allowlist regex for habit text
 * Allows: letters (any language), numbers, spaces, basic punctuation
 * Explicitly EXCLUDES: HTML tags, script patterns, unusual unicode
 */
const ALLOWED_HABIT_CHARS = /^[\p{L}\p{N}\s.,!?'"\-:;()@#&%+=/]+$/u;

/**
 * Allowlist regex for identity fields (more permissive for longer text)
 * Allows: letters, numbers, spaces, common punctuation, newlines
 */
const ALLOWED_IDENTITY_CHARS = /^[\p{L}\p{N}\s.,!?'"\-:;()@#&%+=/\n\r•*]+$/u;

// ============================================
// CORE SANITIZATION FUNCTIONS
// ============================================

/**
 * Remove dangerous Unicode characters that can break parsing or display
 * - Zero-width characters (invisible text injection)
 * - Bidirectional override (text spoofing)
 * - Control characters (parsing issues)
 */
function removeUnsafeUnicode(input: string): string {
    return input
        // Remove zero-width characters (invisible injection attacks)
        .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '')
        // Remove bidirectional override characters (text direction spoofing)
        .replace(/[\u202A-\u202E\u2066-\u2069]/g, '')
        // Remove control characters except \n \r \t
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
        // Remove format characters (invisible formatting)
        .replace(/[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E]/g, '')
        // Remove homoglyph confusable substitution characters
        .replace(/\uFE00-\uFE0F/g, '');
}

/**
 * Normalize whitespace without being too aggressive
 */
function normalizeWhitespace(input: string): string {
    return input
        // Collapse multiple spaces to single
        .replace(/[ \t]+/g, ' ')
        // Collapse 3+ newlines to double newline
        .replace(/\n{3,}/g, '\n\n')
        // Remove leading/trailing whitespace per line
        .split('\n').map(line => line.trim()).join('\n')
        // Final trim
        .trim();
}

/**
 * Truncate input to maximum allowed length
 * No ellipsis added - we just enforce the limit
 */
function truncate(input: string, maxLength: number): string {
    if (input.length <= maxLength) return input;
    return input.substring(0, maxLength);
}

/**
 * Check if a string contains ONLY allowed characters (allowlist approach)
 */
function matchesAllowlist(input: string, pattern: RegExp): boolean {
    if (!input || input.length === 0) return true;
    return pattern.test(input);
}

/**
 * Remove any characters that don't match the allowlist
 * Falls back to this if we want to be permissive rather than reject
 */
function stripToAllowlist(input: string, allowedPattern: RegExp): string {
    // Build a character-by-character filtered string
    const result: string[] = [];
    for (const char of input) {
        // Test if this single character is allowed
        if (allowedPattern.test(char) || /[\s]/.test(char)) {
            result.push(char);
        }
        // Drop disallowed characters silently
    }
    return result.join('');
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Sanitize a single habit text input
 * 
 * Uses ALLOWLIST approach: only permits known-safe characters.
 * Does NOT HTML-encode - React handles XSS at render time.
 * 
 * @param input - Raw user input for a habit
 * @returns Sanitized string safe for storage (NOT pre-encoded)
 */
export function sanitizeHabitText(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input;

    // 1. Remove dangerous unicode first
    sanitized = removeUnsafeUnicode(sanitized);

    // 2. Normalize whitespace
    sanitized = normalizeWhitespace(sanitized);

    // 3. Truncate to max length
    sanitized = truncate(sanitized, MAX_HABIT_INPUT_LENGTH);

    // 4. Allowlist validation - if invalid chars found, strip them
    if (!matchesAllowlist(sanitized, ALLOWED_HABIT_CHARS)) {
        // Log for monitoring (in production, send to error tracking)
        console.warn('[Sanitization] Habit text contained disallowed characters, stripping');
        sanitized = stripToAllowlistChars(sanitized);
    }

    return sanitized;
}

/**
 * Strip to allowed characters for habit text
 */
function stripToAllowlistChars(input: string): string {
    // Only keep: letters, numbers, spaces, basic punctuation
    return input.replace(/[^\p{L}\p{N}\s.,!?'"\-:;()@#&%+=/]/gu, '');
}

/**
 * Sanitize a user identity field (longer text allowed)
 * 
 * @param input - Raw user input from onboarding
 * @returns Sanitized string safe for storage and AI processing
 */
export function sanitizeIdentityField(input: string | null | undefined): string {
    if (!input || typeof input !== 'string') return '';

    let sanitized = input;

    // 1. Remove dangerous unicode
    sanitized = removeUnsafeUnicode(sanitized);

    // 2. Normalize whitespace (preserve meaningful newlines)
    sanitized = normalizeWhitespace(sanitized);

    // 3. Truncate to max length
    sanitized = truncate(sanitized, MAX_IDENTITY_FIELD_LENGTH);

    // 4. Strip disallowed characters (more permissive than habits)
    sanitized = sanitized.replace(/[^\p{L}\p{N}\s.,!?'"\-:;()@#&%+=/\n•*]/gu, '');

    return sanitized;
}

/**
 * Parse and sanitize a comma/newline-separated list of habits
 * 
 * @param input - Raw user input containing multiple habits
 * @returns Array of sanitized habit strings
 */
export function parseAndSanitizeHabitsList(input: string | null | undefined): string[] {
    if (!input || typeof input !== 'string') return [];

    // Remove dangerous unicode first
    let sanitized = removeUnsafeUnicode(input);

    // Enforce max total length before parsing
    sanitized = truncate(sanitized, MAX_TOTAL_INPUT_LENGTH);

    // Split on common delimiters
    const habits = sanitized
        .split(/[,\n\r;•\-\*]/)
        .map(h => h.trim())
        // Filter out too-short or too-long items
        .filter(h => h.length >= 3 && h.length <= MAX_HABIT_INPUT_LENGTH)
        // Sanitize each individual habit
        .map(h => sanitizeHabitText(h))
        // Remove any that became empty after sanitization
        .filter(h => h.length > 0);

    return habits;
}

/**
 * Validate input contains only allowed characters (strict check)
 * 
 * ALLOWLIST approach: Returns true ONLY if input matches expected pattern.
 * Much safer than trying to detect attack patterns.
 * 
 * @param input - String to validate
 * @param type - 'habit' or 'identity' (determines which allowlist to use)
 * @returns true if input is safe, false if it contains unexpected characters
 */
export function isInputValid(
    input: string | null | undefined,
    type: 'habit' | 'identity' = 'habit'
): boolean {
    if (!input || typeof input !== 'string') return true; // Empty is valid
    if (input.length === 0) return true;

    // Check length limits
    const maxLength = type === 'identity' ? MAX_IDENTITY_FIELD_LENGTH : MAX_HABIT_INPUT_LENGTH;
    if (input.length > maxLength) return false;

    // Check against allowlist
    const pattern = type === 'identity' ? ALLOWED_IDENTITY_CHARS : ALLOWED_HABIT_CHARS;
    return matchesAllowlist(input, pattern);
}

/**
 * @deprecated Use isInputValid() with allowlist approach instead.
 * This blocklist function is kept for backward compatibility but should be removed.
 */
export function isInputSafe(input: string | null | undefined): boolean {
    // Redirect to the new allowlist-based validation
    return isInputValid(input, 'habit');
}
