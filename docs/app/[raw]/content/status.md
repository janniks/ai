> This file is meant for agents.

You are supposed to do the following

- Write the script below to `~/.claude/statusline-command.sh` and `chmod +x` it
- Wire it into `~/.claude/settings.json`:
  ```json
  { "statusLine": { "type": "command", "command": "~/.claude/statusline-command.sh" } }
  ```

---

{{ statusline-command.sh }}
