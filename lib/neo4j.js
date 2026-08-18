import neo4j from 'neo4j-driver';

let driver;

/**
 * Lazily creates a single shared driver instance pointed at CognoDB.
 * CognoDB speaks openCypher over Bolt, so the official Neo4j driver
 * works unmodified — only the connection details differ.
 */
function getDriver() {
  if (driver) return driver;

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !user || !password) {
    throw new ConfigError(
      'Missing CognoDB connection details. Set COGNODB_URI, COGNODB_USER and ' +
      'COGNODB_PASSWORD as environment variables (see .env.example).'
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
  });

  return driver;
}

export class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

/**
 * Runs a single parameterised Cypher statement inside a managed session
 * and returns plain-JS records. Wraps connectivity failures in a typed
 * error so API routes can return a clean 503 instead of a stack trace.
 */
export async function runQuery(cypher, params = {}) {
  let session;
  try {
    session = getDriver().session();
    const result = await session.run(cypher, params);
    return result.records.map((record) => record.toObject());
  } catch (err) {
    if (err instanceof ConfigError) {
      throw err;
    }
    if (
      err.code === 'ServiceUnavailable' ||
      err.name === 'Neo4jError' ||
      err.code === 'ECONNREFUSED'
    ) {
      throw new DatabaseUnavailableError(
        'Could not reach CognoDB. Check that your instance is running and ' +
        'your connection details in .env are correct.'
      );
    }
    throw err;
  } finally {
    if (session) await session.close();
  }
}

export async function verifyConnectivity() {
  try {
    await getDriver().verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}

/** Converts Neo4j integers / temporal types embedded in node properties to plain JS values. */
export function toPlain(props) {
  const out = {};
  for (const [key, value] of Object.entries(props)) {
    out[key] = neo4j.isInt(value) ? value.toNumber() : value;
  }
  return out;
}
