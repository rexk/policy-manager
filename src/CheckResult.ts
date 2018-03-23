export interface Success {
  granted: true;
}

export interface Failure {
  granted: false;
  reasons: string[];
  errors: Error[];
}

export type CheckResult = Success | Failure;

export function fail(reason: string | Error): Failure {
  if (typeof reason === 'string') {
    return {
      granted: false,
      reasons: [reason],
      errors: [],
    };
  } else if (reason instanceof Error) {
    return {
      granted: false,
      reasons: [],
      errors: [reason],
    };
  }

  return {
    granted: false,
    reasons: [],
    errors: [],
  };
}

export function mergeFailures(fails: Failure[] = []): Failure {
  const reasons = fails
    .map(f => f.reasons)
    .reduce((acc, reason) => acc.concat(reason), []);
  const errors = fails
    .map(f => f.errors)
    .reduce((acc, err) => acc.concat(err), []);
  return {
    granted: false,
    reasons,
    errors,
  };
}

export function success(): Success {
  return {
    granted: true,
  };
}
