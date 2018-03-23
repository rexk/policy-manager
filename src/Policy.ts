import { IAttributes } from './Attributes';
import {
  PolicyNode,
  JoinPolicy,
  PolicyChecker,
  PolicyStatement,
} from './PolicyNode';
import { CheckResult } from './CheckResult';

export class Policy<T> {
  private readonly node: PolicyNode<T>;

  protected constructor(node: PolicyNode<T>) {
    this.node = node;
  }

  check(attributes: T): CheckResult {
    return this.node.check(attributes);
  }

  and(...policies: Policy<T>[]) {
    const nodes = policies.map(p => p.node).concat(this.node);
    return new Policy(JoinPolicy.and(nodes));
  }

  or(...policies: Policy<T>[]) {
    const nodes = policies.map(p => p.node).concat(this.node);
    return new Policy(JoinPolicy.or(nodes));
  }

  static of<T>(description: string, checker: PolicyChecker<T>) {
    return new Policy(new PolicyStatement(description, checker));
  }

  static and<T>(...policies: Policy<T>[]) {
    const nodes = policies.map(p => p.node);
    return new Policy(JoinPolicy.and(nodes));
  }

  static or<T>(...policies: Policy<T>[]) {
    const nodes = policies.map(p => p.node);
    return new Policy(JoinPolicy.or(nodes));
  }
}
