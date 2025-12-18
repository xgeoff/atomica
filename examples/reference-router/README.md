# Routing in Atomica: A Reference Pattern

> This is an example of how routing can be built with Atomica primitives — not a required solution.

## 2. Why This Exists
- Atomica intentionally does not ship a router; routing is state + selection, not a framework concern.
- This example shows how primitives compose to express navigation without new APIs.
- If you are looking for an official router, this is not it.

## 3. What a Router Is (First Principles)
- Observing navigation state, deriving meaning, selecting UI.
- Simple model: `URL → state → expressions → DOM`.
- No lifecycle, no mount phase, no orchestration layer.

## 4. Routing in Atomica’s Model
- Navigation is a signal; route selection is derived state; view switching is just expressions.
- In Atomica, routing is not a subsystem — it is an application of the reactive model.

## 5. Anatomy of the Reference Router
### 5.1 Location as State
- Pathname stored in a signal, updated explicitly via navigation and `popstate` listener.
- Explicit state is intentional: nothing happens unless you set the signal.

### 5.2 Routes as Data
- Routes are plain objects `{ path, View }`; no loaders, guards, or hooks.
- Routes describe what exists, not when it runs.

### 5.3 Route Selection via Expressions
- Active route is chosen via derived state and rendered through expressions.
- Switching routes does not re-run components.

### 5.4 Navigation as Intentional State Change
- `<Link>` prevents default navigation and calls `navigate()`.
- Navigation is not special — it is just a signal update.

## 6. Async and Routing (No Magic)
- Routes do not imply fetching; `resource()` is opt-in inside a view.
- Async is not canceled on navigation; latest-wins semantics apply.
- Routing does not own async timing in Atomica — your app does.

## 7. Diagnostics: Proving the Model
- Diagnostics validate routing behavior: components run once; navigation does not trigger re-execution.
- Example: component constructions stay at 1; signal/computed counters move instead.
- If diagnostics contradict this document, the document is wrong.

## 8. What This Router Does NOT Do
- No nested routes, param helpers, loaders, guards, transitions, or SSR. Omissions are intentional.

## 9. When You Might Want Something Else
- File-based routing, auth-driven redirects, SSR/SEO, or convention-heavy teams may prefer other approaches.
- Atomica does not prevent these — it simply does not prescribe them.

## 10. How to Use This Example
- Copy parts, adapt freely, or discard entirely.
- Using Atomica does not imply using this router.

## 11. Closing: Reference, Not Framework
- Atomica values composability; examples teach better than mandates.
- This router exists to explain, not dominate.
- If you understand this example, you understand how to build your own.
