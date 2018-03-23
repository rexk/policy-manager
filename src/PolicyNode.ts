import { IAttributes } from './Attributes';
import {
  CheckResult,
  fail,
  success,
  Failure,
  mergeFailures,
} from './CheckResult';

export type PolicyChecker<T> = (attributes: T) => boolean;

export interface IPolicy<T> {
  check(attributes: T): CheckResult;
}

export class PolicyStatement<T> implements IPolicy<T> {
  private readonly checker: PolicyChecker<T>;
  readonly description: string;

  constructor(description: string, checker: PolicyChecker<T>) {
    this.checker = checker;
    this.description = description;
  }

  check(attributes: T): CheckResult {
    try {
      const result = this.checker(attributes);
      if (!result) {
        return fail(this.description);
      }

      return success();
    } catch (err) {
      return fail(err);
    }
  }
}

type AggregateChecker = (results: CheckResult[]) => boolean;

const AndCheck = (results: CheckResult[]) => results.every(r => r.granted);
const OrCheck = (results: CheckResult[]) => results.some(r => r.granted);

export class JoinPolicy<T> implements IPolicy<T> {
  readonly description: 'and' | 'or';
  readonly children: IPolicy<T>[];
  private readonly aggregate: AggregateChecker;

  constructor(
    description: 'and' | 'or',
    children: IPolicy<T>[] = [],
    aggreate: AggregateChecker,
  ) {
    this.description = description;
    this.children = children;
    this.aggregate = aggreate;
  }

  check(attributes: T) {
    if (this.children.length === 0) {
      return fail(
        new Error(`Policy(${this.description} must have at least one child`),
      );
    }

    const results = this.children.map(c => c.check(attributes));
    const result = this.aggregate(results);
    if (!result) {
      const failures = results.filter(f => f.granted === false) as Failure[];
      return mergeFailures(failures);
    }

    return success();
  }

  static and<T>(children: IPolicy<T>[]) {
    return new JoinPolicy('and', children, AndCheck);
  }

  static or<T>(children: IPolicy<T>[]) {
    return new JoinPolicy('or', children, OrCheck);
  }
}

export type PolicyNode<T> = PolicyStatement<T> | JoinPolicy<T>;
