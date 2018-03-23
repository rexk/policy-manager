import { Decision, deny, grant, AccessDenial } from './CheckResult';

export type PolicyChecker<T> = (attributes: T) => boolean;

export interface IPolicy<T> {
  check(attributes: T): Decision;
  describe(): string;
}

export class PolicyStatement<T> implements IPolicy<T> {
  private readonly checker: PolicyChecker<T>;
  readonly description: string;

  constructor(description: string, checker: PolicyChecker<T>) {
    this.checker = checker;
    this.description = description;
  }

  check(attributes: T): Decision {
    try {
      const result = this.checker(attributes);
      if (!result) {
        return deny(this.description);
      }

      return grant();
    } catch (err) {
      return deny(err);
    }
  }

  describe(): string {
    return this.description;
  }
}

type AggregateChecker = (results: Decision[]) => boolean;

const AndCheck = (results: Decision[]) => results.every(r => r.granted);
const OrCheck = (results: Decision[]) => results.some(r => r.granted);

function concat<T>(items: T[][]): T[] {
  return items.reduce((acc, item) => item.concat(item), []);
}

/**
 * merges all reasons and errors. caused denials
 *
 * @param denials
 */
function mergeDenials(denials: AccessDenial[] = []): AccessDenial {
  const reasons = concat(denials.map(f => f.reasons));
  const errors = concat(denials.map(f => f.errors));
  return {
    granted: false,
    reasons,
    errors,
  };
}

export class PolicyJoin<T> implements IPolicy<T> {
  readonly description: 'and' | 'or';
  readonly policies: IPolicy<T>[];
  private readonly aggregate: AggregateChecker;

  constructor(
    description: 'and' | 'or',
    policies: IPolicy<T>[] = [],
    aggreate: AggregateChecker,
  ) {
    this.description = description;
    this.policies = policies;
    this.aggregate = aggreate;
  }

  check(attributes: T) {
    if (this.policies.length === 0) {
      return deny(
        new Error(`Policy(${this.description} must have at least one child`),
      );
    }

    const results = this.policies.map(c => c.check(attributes));
    const result = this.aggregate(results);
    if (!result) {
      const failures = results.filter(
        f => f.granted === false,
      ) as AccessDenial[];
      return mergeDenials(failures);
    }

    return grant();
  }

  describe(): string {
    return this.policies.map(p => p.describe()).join(` ${this.description}`);
  }

  static and<T>(policies: IPolicy<T>[]) {
    return new PolicyJoin('and', policies, AndCheck);
  }

  static or<T>(policies: IPolicy<T>[]) {
    return new PolicyJoin('or', policies, OrCheck);
  }
}

export type PolicyNode<T> = PolicyStatement<T> | PolicyJoin<T>;
