# Policy Manager

Provides a fluent API to create flexible and fluent API to create policies for ABAC.

## Getting started

Install policy control via `yarn` or `npm`

```sh
npm i policy-control

# or

yarn add policy-control
```

## Example

We would like to inspect users at bar.

```ts
import { Policy } from 'policy-manager';

interface Attributes {
  role: 'faculty' | 'student' | 'parent';
  age: number;
}

const GuestOnly = Policy.of(
  'User must be a faculty member',
  (attr: Attributes) => attr.role === 'guest',
);

const AdultOnly = Policy.of(
  'User must be older than 21',
  (attr: Attributes) => attr.age > 21,
);

// BarDrinkPolicy: User must be a guest and adult.
const BarDrinkPolicy = Policy.and(GuestOnly, AdultOnly);
// or const BarDrinkPolicy = GuestOnly.and(AdultOnly);

const visitor1 = {
  role: 'faculty',
  age: 25,
};

const visitor2 = {
  role: 'student',
  age: 12
};

const visitors = [visitor1, visitor2];

visitors.forEach(visitor => {
  const drinkPermission = BarDrinkPolicy.check(visitor);

  if (drinkPermission.granted) {
    drink();
  } else {
    console.log(drinkPermission);
  }
});

// prints following
{ 
  granted: false,
  reasons: [ 'User must be a guest', 'User must be older than 21' ],
  errors: [] 
}
```