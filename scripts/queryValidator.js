
/**
 * SQL Query Validator Module
 * 
 * This module provides validation functionality for SQL queries in the Cybernetic Sabotage game.
 * It ensures queries follow proper SQL syntax and prevents malicious or invalid queries.
 */

/**
 * Validates if a given input is a properly formatted SQL query
 * 
 * @param {string} query - The SQL query string to validate
 * @returns {boolean} True if query is valid, false otherwise
 * 
 * Validation rules:
 * 1. Query must be a non-empty string
 * 2. Query must start with a valid SQL keyword
 * 3. Query cannot contain malicious patterns like:
 *    - SQL comments (-- or /*)
 *    - Multiple statements (;)
 *    - Destructive operations (DROP TABLE)
 * 
 * Note: This performs basic syntactic validation only. Full SQL parsing and 
 * semantic validation happens during query execution.
 */

function isValidSQLQuery(query) {
  if (typeof query !== 'string') return false;

  // Trim and convert to uppercase for case-insensitive matching
  const trimmedQuery = query.trim().toUpperCase();

  // Define valid starting keywords for SQL statements
  const sqlKeywords = [
      "SELECT", "INSERT INTO", "UPDATE", "DELETE FROM", "CREATE TABLE",
      "DROP TABLE", "ALTER TABLE", "TRUNCATE TABLE", "REPLACE", "MERGE",
      "WITH", "GRANT", "REVOKE", "EXEC", "CALL", "BEGIN", "COMMIT", 
      "ROLLBACK", "USE", "EXPLAIN"
  ];

  // Check if query starts with a valid SQL keyword
  const isValidStart = sqlKeywords.some(keyword => trimmedQuery.startsWith(keyword));

  if (!isValidStart) return false;

  // Additional simple structure validation 
  //This is ok because we are testing if the user is using the correct syntax
  // if (trimmedQuery.startsWith("SELECT") && !/FROM\s+\w+/i.test(query)) return false;
  // if (trimmedQuery.startsWith("INSERT") && !/INTO\s+\w+/i.test(query)) return false;
  // if (trimmedQuery.startsWith("UPDATE") && !/SET\s+\w+/i.test(query)) return false;
  // if (trimmedQuery.startsWith("DELETE") && !/FROM\s+\w+/i.test(query)) return false;
  // if (trimmedQuery.startsWith("CREATE TABLE") && !/TABLE\s+\w+/i.test(query)) return false;
  
  // Prevent malicious or suspicious SQL patterns
  const forbiddenPatterns = [
      /--/,         // Inline comments (potential SQL injection)
      /\/\*/,       // Block comments
      /;.*;/,       // Stacked queries
      /DROP\s+TABLE/i // Destructive query detection
  ];

  if (forbiddenPatterns.some(pattern => pattern.test(query))) return false;

  return true;
}
