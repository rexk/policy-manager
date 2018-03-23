import { Policy } from '../Policy';

describe('Policy', () => {
  const attributes = {
    user: {
      role: 'guest',
      age: 18,
    },
  };

  describe('Single Policy Check', () => {
    it('should be granted.', () => {
      const GuestOnly = Policy.of(
        'User must be guest',
        (attr: typeof attributes) => attr.user.role === 'guest',
      );

      const result = GuestOnly.check(attributes);
      expect(result.granted).toBeTruthy();
    });

    it('should not be granted', () => {
      const GuestNotAllowed = Policy.of(
        'User must be guest',
        (attr: typeof attributes) => attr.user.role !== 'guest',
      );

      const result = GuestNotAllowed.check(attributes);
      expect(result.granted).toBeFalsy();
    });
  });
});
