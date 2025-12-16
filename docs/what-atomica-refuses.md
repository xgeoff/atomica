# What Atomica Refuses to Be

Atomica exists because modern UI frameworks have become *harder than the problems they solve*.

This document is not a list of missing features.
It is a list of **intentional refusals**.

These constraints are not temporary. They are the product.

---

## Atomica Refuses to Be a Re-rendering Framework

Atomica does not re-render components by default.

* Updating state does **not** re-execute component functions
* There is no “render cycle”
* There is no “when does this run again?” question

State changes update **only the DOM nodes that depend on that state**.

If you are thinking in terms of *re-renders*, you are thinking in the wrong model.

---

## Atomica Refuses to Have Lifecycles

There are no lifecycle methods.

There is:

* state
* derived state
* effects that react to state

Atomica does not have:

* `useEffect`
* `componentDidMount`
* `componentDidUpdate`
* cleanup semantics hidden behind timing rules

If something needs to happen when state changes, you express that *directly*.

---

## Atomica Refuses to Hide Reactivity

Reactivity in Atomica is **explicit and visible**.

You can see:

* what depends on what
* what updates when state changes

There are no:

* dependency arrays
* stale closures
* rules-of-hooks
* implicit subscriptions

If something reacts, it’s because you wrote the reaction.

---

## Atomica Refuses to Be JSX-Centric

JSX is optional.

Atomica’s real API is functions.

* JSX is compile-time sugar
* JSX is not required
* JSX does not influence architecture

If JSX disappeared tomorrow, Atomica would continue to function unchanged.

---

## Atomica Refuses to Be “Magic”

Atomica avoids invisible behavior.

There is no:

* scheduler you have to learn
* priority system you didn’t ask for
* concurrency model you didn’t opt into

When something updates, it’s because a signal changed.

That’s it.

---

## Atomica Refuses to Be a Meta-Framework

Atomica is not:

* a router
* a bundler
* a data-fetching framework
* a styling solution
* an opinionated app architecture

Atomica solves **one problem**:

> Keeping the DOM in sync with state, precisely and predictably.

Everything else belongs on top.

---

## Atomica Refuses to Optimize Prematurely

Atomica favors:

* correctness over cleverness
* clarity over abstraction
* small primitives over extensible systems

Performance emerges from simplicity, not from layers.

---

## Atomica Refuses to Grow Without Pressure

New features are not added because they are common elsewhere.

A feature is only added when:

* it cannot be built cleanly on top
* its absence causes real friction in the playground
* it preserves Atomica’s mental model

If a feature can live outside the core, it should.

---

## Atomica Refuses to Forget Why It Exists

Atomica exists because:

* UI code should be understandable by reading it
* State changes should be obvious
* You should not need a framework-specific worldview to build interfaces

Atomica will remain small.

If it stops being small, it will stop being Atomica.

---

## A Note to Contributors

If you are about to add:

* a new abstraction
* a new lifecycle concept
* a new “helper” that hides behavior

Stop.

Ask whether it makes the model clearer — or merely more familiar.

Familiarity is not a goal.
Clarity is.
