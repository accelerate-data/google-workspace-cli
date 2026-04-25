/**
 * Generic skill contract assertion.
 *
 * Checks boolean fields and required/forbidden terms in the LLM JSON output.
 * Add skill-specific fields to the `checks` array as your skill evolves.
 *
 * Expected vars (all optional — omit to skip the check):
 *   expect_<field>: "true" | "false"
 *   required_terms: comma-separated terms that must appear in the JSON output
 *   forbidden_terms: comma-separated terms that must not appear in the JSON output
 */

const { extractJsonObject, normalizeTerms } = require('./schema-helpers');

function parseExpectedBoolean(value) {
  if (value === undefined) return null;
  return String(value).trim().toLowerCase() === 'true';
}

module.exports = (output, context) => {
  let payload;
  try {
    payload = extractJsonObject(output);
  } catch (error) {
    return {
      pass: false,
      score: 0,
      reason: `Failed to parse JSON output: ${error.message}`,
    };
  }

  // Add your skill-specific boolean fields here.
  // Each entry is [json_field_name, expected_value_from_vars].
  const checks = [
    // Example:
    // ['reads_context_first', parseExpectedBoolean(context.vars.expect_reads_context_first)],
    // ['creates_output', parseExpectedBoolean(context.vars.expect_creates_output)],
  ];

  for (const [field, expected] of checks) {
    if (expected === null) continue;
    if (payload[field] !== expected) {
      return {
        pass: false,
        score: 0,
        reason: `Expected ${field}=${expected}, got ${payload[field]}`,
      };
    }
  }

  const requiredTerms = normalizeTerms(context.vars.required_terms);
  if (requiredTerms.length > 0) {
    const haystack = JSON.stringify(payload).toLowerCase();
    const missing = requiredTerms.filter((term) => !haystack.includes(term));
    if (missing.length > 0) {
      return {
        pass: false,
        score: 0,
        reason: `Missing required terms: ${missing.join(', ')}`,
      };
    }
  }

  const forbiddenTerms = normalizeTerms(context.vars.forbidden_terms);
  if (forbiddenTerms.length > 0) {
    const haystack = JSON.stringify(payload).toLowerCase();
    const found = forbiddenTerms.filter((term) => haystack.includes(term));
    if (found.length > 0) {
      return {
        pass: false,
        score: 0,
        reason: `Found forbidden terms: ${found.join(', ')}`,
      };
    }
  }

  return {
    pass: true,
    score: 1,
    reason: 'Skill contract matched expected output',
  };
};
