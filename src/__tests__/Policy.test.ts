import { Policy } from '../Policy';

describe('Policy', () => {
  const attributes = {
    user: {
      role: 'guest',
      age: 20,
    },
  };
  const policies = {
    GuestOnly: Policy.of(
      'User must be guest',
      (attr: typeof attributes) => attr.user.role === 'guest',
    ),
    GuestNotAllowed: Policy.of(
      'User must be guest',
      (attr: typeof attributes) => attr.user.role !== 'guest',
    ),
    OnlyYoung: Policy.of(
      'User must be younger than 18',
      (attr: typeof attributes) => attr.user.age < 18,
    ),
    OnlyAdults: Policy.of(
      'User must be older than 21',
      (attr: typeof attributes) => attr.user.age > 21,
    ),
  };

  const { GuestOnly, GuestNotAllowed, OnlyYoung, OnlyAdults } = policies;
  describe('Single Policy Check', () => {
    it('should be granted.', () => {
      const result = GuestOnly.check(attributes);
      expect(result.granted).toBeTruthy();
    });

    it('should not be granted', () => {
      const result = GuestNotAllowed.check(attributes);
      expect(result.granted).toBeFalsy();
    });
  });

  describe('Multiple Policies(And)', () => {
    it('should be not granted to drink', () => {
      const policy = GuestOnly.and(OnlyAdults);
      // Can I drink?
      const result = policy.check(attributes);
      expect(result.granted).toBeFalsy();
    });
  });
});
