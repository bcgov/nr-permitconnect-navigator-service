# Frontend Test Standards

This document is the standard for how test files in this codebase should
be structured going forward. New and refactored specs should follow it.
It isn't exhaustive -- add to it as new patterns get established.

## Mounting utilities

Two shared entry points live in `tests/`. Pick based on what the
component under test actually needs:

| Utility | Use when the component... |
|---|---|
| `mountComponent` | Establishes its own `<Form>` context internally, or needs no vee-validate form context at all -- just Pinia / provide / stubs. This is the default. |
| `mountWithFormContext` | **Assumes an ancestor** already provides vee-validate's form context (a field/section component that doesn't render its own `<Form>`). |

`mountWithFormContext` mounts the component inside a synthetic harness
that calls `useForm()` on its behalf. Reach for it only when the
component genuinely has no other way to get a form context in the test
-- using it on a component that owns its own `<Form>` creates a nested,
shadowed context instead of an error, which is a quiet bug to track down
later. When in doubt, start with `mountComponent`; only switch to
`mountWithFormContext` if the component throws on a missing form
context (e.g. `useIsFormDirty`/`useFormValues`/`useField` with no
provider).

## Router mocking

`tests/mockRouter.ts` exports a shared `mockRouter` (`{ push, replace }`)
and `resetMockRouter()`. It's deliberately separate from the mounting
utilities above -- routing is an unrelated concern, not something every
mounted component needs. Use it in any spec that needs to assert on
navigation:

```ts
import { mockRouter, resetMockRouter } from '../utils/mockRouter';

// vi.mock is hoisted, so it can't reference `mockRouter` directly from the
// shared util at declaration time -- but it CAN return the same object
// reference at call time, which is all that matters for spies.
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ params: {}, query: {} })
}));

beforeEach(() => {
  resetMockRouter();
});

// later, in a test:
expect(mockRouter.replace).toHaveBeenCalledWith({ name: RouteName.EXT_GENERAL });
```

If a spec needs `useRoute()` to return different query params per test
(rather than a fixed object), define its own local `vi.fn()` wrapper
around it instead -- `mockRouter` only covers `useRouter()`'s
`push`/`replace`, since that's the part every spec asserting on
navigation needs the same way:

```ts
// `useRoute` is a vi.fn() (rather than returning a fixed object) so
// individual tests can override its return value to exercise the
// query-string-driven pagination logic in the component.
const mockUseRoute = vi.fn(() => ({ query: {} as Record<string, string> }));

vi.mock('vue-router', () => ({
  useRoute: () => mockUseRoute(),
  useRouter: () => mockRouter
}));

// later, in a test:
it('reads rows/sort/page from the query string while on the projects tab', () => {
  mockUseRoute.mockReturnValue({
    query: { tab: '0', rows: '20', order: '1', field: 'projectName', page: '2' }
  });

  const { wrapper } = mountProjectListNavigator();
  // ...assert on the component's reaction to that query...
});
```

(from `ProjectListNavigator.spec.ts`.)

## Pinia store state: seed it, don't mock it

Drive a component's store-dependent behavior by seeding real state via
`piniaState`, not by `vi.mock`-ing the store module. Mocking a store
replaces it wholesale, which hides how the component and the store's
getters actually interact -- a getter that derives from two state fields,
or a computed that depends on another getter, can silently drift out of
sync with the real implementation without any test failing, since the
mock just returns whatever you told it to. Seeding the state a getter
derives from exercises the real computed logic and catches that drift:

```ts
mountComponent(Foo, {
  piniaState: { form: { formType: FormType.NEW, formState: FormState.UNLOCKED } }
});
```

The only sanctioned exception is `useAuthNStore`, described next -- and
even that one is deliberately narrow: it mocks a single leaf module for a
documented, unavoidable reason, not a general pattern to reach for when
seeding state feels inconvenient.

## Authn store mocking (exception to "seed it, don't mock it")

`useAuthNStore` (`src/store/authnStore.ts`) is a Pinia *setup* store. Even
under `createTestingPinia`, only the store's returned actions get
auto-stubbed -- the setup() body itself still runs for real, which
unconditionally constructs a real `AuthService` / `oidc-client-ts`
`UserManager`. With `monitorSession` on by default, that spins up a
`SessionMonitor` whose constructor fires an unawaited `getUser()`, logging
`"[UserManager] getUser: user not found in storage"` to the console in
every spec that touches the real store -- there's no `piniaState` to seed
around this, since it happens before any state is read.

Because of that, specs depending on `useAuthNStore` are a deliberate
exception to the "seed it, don't mock it" rule above:
use `tests/mockAuthNStore.ts` instead.

```ts
import { mockAuthNStore, resetMockAuthNStore } from '../../../mockAuthNStore';

vi.mock('@/store/authnStore', () => ({
  default: () => mockAuthNStore,
  useAuthNStore: () => mockAuthNStore
}));

beforeEach(() => {
  resetMockAuthNStore();
});

// later, in a test:
mockAuthNStore.getIsAuthenticated.value = true;
mockAuthNStore.getProfile.value = testProfile;
```

Mock the leaf module `@/store/authnStore`, not the `@/store` barrel --
that keeps every other store re-exported from `@/store` real for specs
that need both. This doesn't apply to any other store; every other store
should still be driven via real `piniaState` per the rule above.

## Local mount factory

Every spec defines exactly one local factory that wraps the appropriate
shared utility above with that file's own defaults (props, piniaState,
stubs, provide, etc). Name it **`mount` + the component's name** --
e.g. `mountCancelButton`, `mountNaturalDisasterCard`,
`mountProjectListNavigator`. The pattern is fixed; the name itself
isn't -- every spec should be immediately recognizable as
"`mount` + whatever this file is testing."

```ts
function mountCancelButton(options: { editable?: boolean } = {}) {
  const onClicked = vi.fn();

  const { wrapper } = mountWithFormContext(CancelButton, {
    fields: ['testField'],
    componentProps: { ...options, onClicked }
  });

  return { wrapper, onClicked };
}
```

(from `CancelButton.spec.ts` -- see also `ContactCardIntakeForm.spec.ts` for
the same pattern with real `piniaState` and multiple returned values.)

Rules for the local mount factory:

- **Always takes an options object with defaults**, never positional
  arguments -- `mountCancelButton({ editable: false })`, not
  `mountCancelButton(false)`.
- **Always returns an object**, even if it only contains `wrapper`. Never
  return a bare wrapper. This keeps every call site's destructuring
  (`const { wrapper } = mountCancelButton()`) valid regardless of which
  spec you copy it from.
- Lives near the top of the file, immediately after fixtures (see layout
  below), so it's the first thing a reader sees before the tests
  themselves.

## File layout

Every spec follows the same section order, marked with a one-line
comment banner (not a boxed/bordered one -- keep it light):

```ts
// Mocks

vi.mock('vue-router', () => ({ ... }));

// Fixtures

const testFoo = { ... };

// Mount

function mountComponentName(options = {}) { ... }

beforeEach(() => { ... });

// Tests

describe('ComponentName', () => {
  describe('rendering', () => { ... });
  describe('validation', () => { ... });
  describe('user interaction', () => { ... });
});
```

Notes:

- **Mocks always come first, unconditionally.** `vi.mock` calls are
  hoisted by Vitest regardless of where they're written in the file, so
  placing them anywhere else misrepresents execution order to a reader.
- **Fixtures** are named, reusable, known-good pieces of test data (e.g.
  `testProject`, `sampleContact`) -- pulled out of individual `it()`
  blocks so multiple tests share the exact same input, one place to
  update when a type shape changes, and tests read as behavior rather
  than data setup.
- Keep every section present even when it's nearly empty (e.g. a
  component with barely any fixtures). Consistency across the suite
  matters more than saving a few lines in short files.
- **`// Tests` goes after `beforeEach`/`afterEach`, immediately before
  the root `describe` block** -- not before them. The lifecycle hooks
  are setup tightly coupled to the mount factory (often resetting mocks
  it depends on), so they stay grouped under `// Mount`; `// Tests`
  marks where the actual test bodies begin. Every section gets a banner,
  including this last one -- consistency across the whole file matters
  more than a banner being technically redundant with the `describe`
  title beneath it.
- Within the root `describe`, group nested `describe`s by concern, not
  by method/prop name. Prefer a small, consistent vocabulary across the
  whole codebase: `rendering`, `validation`, `user interaction`, or a
  specific named behavior (e.g. `form error reporting`). Don't let each
  file invent its own taxonomy.

## Known gotchas

**Never `vi.spyOn` a Pinia getter -- drive the real state instead.**
A Pinia getter is a `computed()` ref stored as a plain property value,
not a real accessor descriptor. `vi.spyOn(store, 'someGetter', 'get')`
does not reliably attach, and direct assignment
(`store.someGetter = value`) silently no-ops (computed refs are
read-only; Vue just logs a dev warning). This applies **even when the
getter looks like a callable method** -- e.g. `authzStore.can(...)` is
actually `computed(() => (initiative, resource, action) => boolean)`,
not a plain action, despite being called like one. The only reliable
fix is to seed the real state the getter derives from, via
`piniaState`, e.g.:

```ts
mountComponent(Foo, {
  piniaState: { form: { formType: FormType.NEW, formState: FormState.UNLOCKED } }
});
```

Plain **actions** (`setFormError`, `setAuthorizationContext`, etc.) are
ordinary functions and spy normally -- `createTestingPinia` stubs them
automatically by default, or `vi.spyOn(store, 'someAction')` works fine
if you need a custom implementation. The distinction is getters vs.
actions, not "looks like a function call" vs. "looks like a property."

**`.props('key')` can fail to typecheck on a union of wrapper types.**
`VueWrapper#props()` is overloaded (`props(): Props` and
`props<K>(key: K): Props[K]`). When you call `.props('key')` on a value
whose type is a union of *different* generic instantiations of
`VueWrapper` (e.g. iterating `[...findAllComponents(A), ...findAllComponents(B)]`),
TypeScript can't merge the overload sets across the union and falls back
to the zero-arg overload only. Use `.props().key` in that situation --
it works because the zero-arg overload is common to every member of the
union. A single, non-unioned `findComponent(X).props('key')` is fine as-is.

**A provided/injected value that's read via template auto-unwrap must be
a genuine `ref`/`computed`, not a plain object shaped like one.**
Vue's template auto-unwrap only triggers for real reactive refs (objects
carrying the internal ref marker), not a plain `{ value: x }` object that
merely looks ref-shaped. If the real app provides a value via
`provide(someKey, computed(() => ...))` and the component reads it
*inside its template* with no `.value`, the test's `provide` option must
use an actual `ref()`/`computed()` too:

```ts
import { ref } from 'vue';

provide: {
  [someKey]: ref('some-value') // not { value: 'some-value' }
}
```

If the component instead reads the injected value via explicit `.value`
in `<script setup>` logic (not the template), a plain `{ value: x }`
object works fine either way, since that's just manual property access,
not Vue's unwrap magic. Check the actual call site before assuming which
one you need.
