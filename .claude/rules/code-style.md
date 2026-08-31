# Code Style

Applies to every JavaScript and TypeScript file in this repository.

Formatting is not a matter of judgement here. **Prettier owns formatting, ESLint owns
correctness.** Do not hand-format, and do not raise formatting in review — change the
config or leave it alone.

- Prettier defaults, unchanged: semicolons, double quotes, 80 columns, two-space indent.
  They are chosen because they are the defaults — nothing to remember, nothing to look up.
- `eslint-config-prettier` goes last in the ESLint config, so ESLint never reports a rule
  Prettier already owns. Formatting has exactly one owner.
- Disabling a lint rule inline needs a reason in the comment that disables it.
- Run format and lint before reporting a task done. Unformatted code is an unfinished task.

Each package owns its own `eslint.config.js` and shares the repository's Prettier config.
The task that scaffolds a package creates them.

Match the surrounding code for everything this file does not cover.
