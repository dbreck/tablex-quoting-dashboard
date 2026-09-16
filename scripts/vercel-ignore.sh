#!/bin/sh
# Vercel ignoreCommand: exit 0 = skip the build (docs-only push), exit 1 = build.
# Anything else (e.g. git's 128 "bad object") makes Vercel mark the deployment
# Error, which is what happened when VERCEL_GIT_PREVIOUS_SHA fell out of the
# shallow clone after a run of docs-only commits (9/15-9/16). Deepen first.
p=${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}
git cat-file -e "$p^{commit}" 2>/dev/null \
  || git fetch -q --deepen=300 origin 2>/dev/null \
  || git fetch -q --unshallow origin 2>/dev/null
git cat-file -e "$p^{commit}" 2>/dev/null || exit 1
if git diff --quiet "$p" HEAD -- . ':(exclude)*.md' ':(exclude)docs' ':(exclude).gitignore' ':(exclude).claude'; then
  exit 0
else
  exit 1
fi
