#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
TSC_BIN="$ROOT_DIR/node_modules/.bin/tsc"
export npm_config_cache="$TMP_DIR/.npm-cache"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [[ ! -x "$TSC_BIN" ]]; then
  echo "TypeScript binary not found at $TSC_BIN. Run pnpm install first." >&2
  exit 1
fi

pnpm --filter atomica-shared --filter atomica-signals --filter atomica-dom --filter atomica build >/dev/null

pack_pkg() {
  local pkg_dir="$1"
  (cd "$pkg_dir" && npm pack --pack-destination "$TMP_DIR" | tail -n 1)
}

SHARED_PACK="$(pack_pkg "$ROOT_DIR/packages/shared")"
SIGNALS_PACK="$(pack_pkg "$ROOT_DIR/packages/signals")"
DOM_PACK="$(pack_pkg "$ROOT_DIR/packages/dom")"
ATOMICA_PACK="$(pack_pkg "$ROOT_DIR/packages/atomica")"

SHARED_PATH="$TMP_DIR/$SHARED_PACK"
SIGNALS_PATH="$TMP_DIR/$SIGNALS_PACK"
DOM_PATH="$TMP_DIR/$DOM_PACK"
ATOMICA_PATH="$TMP_DIR/$ATOMICA_PACK"
TEST_DIR="$TMP_DIR/install-check"

mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
npm init -y >/dev/null
npm install --offline --no-audit --no-fund --ignore-scripts --fetch-retries=0 \
  "$SHARED_PATH" "$SIGNALS_PATH" "$DOM_PATH" "$ATOMICA_PATH" >/dev/null

cat > index.ts <<'TS'
import { signal, computed } from 'atomica';
import { h } from 'atomica/dom';
import { resource } from 'atomica/signals';

const count = signal(0);
const doubled = computed(() => count.get() * 2);
const vnode = h('div', null, String(doubled.get()));
void vnode;
void resource(async () => 1, { auto: false });
TS

"$TSC_BIN" \
  --noEmit \
  --target ES2020 \
  --module ESNext \
  --moduleResolution Bundler \
  --lib ES2020,DOM \
  index.ts

echo "Pack/install/typecheck passed for $ATOMICA_PACK"
