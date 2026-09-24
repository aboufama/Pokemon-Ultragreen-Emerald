#!/bin/bash
# SessionStart hook for Claude Code on the web: installs what the battle app
# and the gauntlet tools need (see .claude/skills/pokemon-gauntlet), so a fresh
# session can build, render and run the species gates right away.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Node packages (postinstall copies the Draco decoder into public/libs).
# npm install (not ci) so the cached container keeps node_modules.
npm install --no-audit --no-fund

# Python tools: GIF export and asset extraction.
python3 -m pip install --quiet -r tools/requirements.txt || echo "warning: pip install failed; GIF export needs Pillow"

# The decomp: Pokédex text and TM/tutor learnsets for tools/gauntlet/brief.mjs.
# Shallow and optional (the committed extracted data covers everything else).
if [ ! -f decomp/pokeemerald/src/data/pokemon/pokedex_text.h ]; then
  git submodule update --init --depth 1 decomp/pokeemerald || echo "warning: decomp not fetched; brief.mjs will omit Pokédex text"
fi

# Headless Chromium for the render tools: use the preinstalled browsers when
# the environment provides them, else download Playwright's.
if [ -z "${PLAYWRIGHT_BROWSERS_PATH:-}" ] || [ ! -d "${PLAYWRIGHT_BROWSERS_PATH}" ]; then
  npx playwright install chromium || echo "warning: no Chromium; render tools won't run"
fi
