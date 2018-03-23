export interface AccessGrant {
  granted: true;
}

export interface AccessDenial {
  granted: false;
  reasons: string[];
  errors: Error[];
}

export type Decision = AccessGrant | AccessDenial;

export function deny(reason: string | Error): AccessDenial {
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

export function grant(): AccessGrant {
  return {
    granted: true,
  };
}
