type PolicyChecker<T = any> = (item: T) => boolean;

interface Viewer {
  attr(key: string): any;
}

interface IPolicy {
  check(viwer: Viewer): boolean;
}

class PolicyEntity<T = any> implements IPolicy {
  readonly attr: string;
  readonly checker: PolicyChecker<T>;

  constructor(attr: string, checker: PolicyChecker<T>) {
    this.attr = attr;
    this.checker = checker;
  }

  check(viewer: Viewer) {
    const item = viewer.attr(this.attr);
    return this.checker(item);
  }

  static of<T>(attr: string, checker: PolicyChecker<T>) {
    return new PolicyEntity(attr, checker);
  }
}

class PolicyOperator implements IPolicy {
  readonly children: IPolicy[];
  readonly checker: (viewer: Viewer, items: IPolicy[]) => boolean;

  constructor(
    children: IPolicy[],
    checker: (viewer: Viewer, items: IPolicy[]) => boolean
  ) {
    this.children = children;
    this.checker = checker;
  }

  check(viewer: Viewer) {
    return this.checker(viewer, this.children);
  }

  static And(...items: IPolicy[]) {
    return new PolicyOperator(items, (viewer, items) =>
      items.every(item => item.check(viewer))
    );
  }

  static Or(...items: IPolicy[]) {
    return new PolicyOperator(items, (viewer, items) =>
      items.some(item => item.check(viewer))
    );
  }
}

class Policy implements IPolicy {
  private readonly root: IPolicy;

  constructor(root: IPolicy) {
    this.root = root;
  }

  check(viewer: Viewer) {
    return this.root.check(viewer);
  }

  and<T>(attr: string, checker: PolicyChecker<T>) {
    return Policy.from(
      PolicyOperator.And(this.root, PolicyEntity.of(attr, checker))
    );
  }

  or<T>(attr: string, checker: PolicyChecker<T>) {
    return Policy.from(
      PolicyOperator.Or(this.root, PolicyEntity.of(attr, checker))
    );
  }

  static from(root: IPolicy) {
    return new Policy(root);
  }

  static of<T>(attr: string, checker: PolicyChecker<T>) {
    return Policy.from(PolicyEntity.of(attr, checker));
  }
}
