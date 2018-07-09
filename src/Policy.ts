import {
  PolicyNode,
  PolicyJoin,
  PolicyChecker,
  PolicyStatement,
} from './PolicyNode';
import { Decision } from './AccessDecision';

/**
 * Policy helps to create policies using a function in which
 * generic Attribute instance is validated for a access request.
 *
 * Internally, policy maintains its statements as a tree with PolicyNode.
 *
 * @typeparam Attributes  A generic Attributes to be used to construct policies.
 */
export class Policy<Attributes> {
  readonly node: PolicyNode<Attributes>;

  protected constructor(node: PolicyNode<Attributes>) {
    this.node = node;
  }

  /**
   * Checks if given Attributes (Rule Parameters) satisfy this policy.
   *
   * @param {Attributes} attributes   A attributes to be inspected.
   * @return {Decision}
   */
  check(attributes: Attributes): Decision {
    return this.node.check(attributes);
  }

  /**
   * combines this policy with other policies under 'and' node.
   *
   * p1.and(p2, p3) result in a new a Policy('p1 and p2 and p3')
   *
   * @param {...Policy<Attributes>}
   * @return {Policy<Attributes>}
   */
  and(...policies: Policy<Attributes>[]) {
    const nodes = policies.map(p => p.node).concat(this.node);
    return new Policy(PolicyJoin.and(nodes));
  }

  /**
   * combines this policy with other policies under 'or' node.
   *
   * p1.or(p2, p3) result in a new a Policy('p1 or p2 or p3')
   *
   * @param {...Policy<Attributes>} policies
   * @return {Policy<Attributes>}
   */
  or(...policies: Policy<Attributes>[]) {
    const nodes = policies.map(p => p.node).concat(this.node);
    return new Policy(PolicyJoin.or(nodes));
  }

  /**
   * Creates a Policy using description and checker.
   * @param description
   * @param checker
   */
  static of<T>(description: string, checker: PolicyChecker<T>) {
    return new Policy(new PolicyStatement(description, checker));
  }

  /**
   * Groups multiple policies with AND operator.
   *
   * @param {Policy[]} policies
   */
  static and<T>(...policies: Policy<T>[]) {
    const nodes = policies.map(p => p.node);
    return new Policy(PolicyJoin.and(nodes));
  }

  /**
   * Groups multiple policies with OR operator.
   */
  static or<T>(...policies: Policy<T>[]) {
    const nodes = policies.map(p => p.node);
    return new Policy(PolicyJoin.or(nodes));
  }
}
