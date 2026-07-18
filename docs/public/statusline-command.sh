#!/bin/bash
# ~/.claude/statusline-command.sh
# Lean p10k-style statusline: host · dir · git · ctx% · model · effort · cost · rate limits
# Weekly rate limit is pace-colored: usage % vs elapsed fraction of the 7d window.

input=$(cat)

# ============================== CONFIG =======================================
# Fallback width when COLUMNS is absent (Claude Code < 2.1.153).
BUDGET=50
# Drop order when the line is too long: first listed is dropped first.
# Segment keys: host dir git ctx model cost diff rate
DROP_ORDER="cost dir diff rate model ctx"
# Flex gaps: segments spread space-between within COLUMNS, gap clamped to this.
GAP_MIN=2
GAP_MAX=8
# Layout algorithm:
#   between — even gaps between all segments (justify: space-between, capped)
#   split   — first half flex-start, second half flex-end, one big middle gap
LAYOUT="split"
# =============================================================================

# --- Nerd Font v3 icons (octal printf — safe on macOS bash 3.2) ---
RESET=$'\033[0m'; DIM=$'\033[2m'; BOLD=$'\033[1m'
BLUE=$'\033[38;5;74m';   GREEN=$'\033[38;5;108m'; PEACH=$'\033[38;5;138m'
YELLOW=$'\033[38;5;179m'; RED=$'\033[38;5;174m';  ORANGE=$'\033[38;5;173m'
MAGENTA=$'\033[38;5;139m'; CYAN=$'\033[38;5;73m'; GRAY=$'\033[38;5;245m'

color_pct() {  # absolute thresholds: <20 gray, <50 green, <80 yellow, else red
  if [ "$1" -ge 80 ]; then echo "$RED"
  elif [ "$1" -ge 50 ]; then echo "$YELLOW"
  elif [ "$1" -ge 20 ]; then echo "$GREEN"
  else echo "$GRAY"; fi
}

# Rate limit coloring: absolute below 50% (gray <20, green <50) — early-window
# bursts shouldn't alarm. From 50% up, pace-colored: usage % vs elapsed % of
# the window. On/under pace → green; up to 25% over → yellow; beyond → red.
color_pace() {  # $1=used_pct(int) $2=resets_at(epoch s) $3=window_len(s)
  local used=$1 resets=$2 win=$3 now remain elapsed_pct
  if [ "$used" -lt 20 ]; then echo "$GRAY"; return; fi
  if [ "$used" -lt 50 ]; then echo "$GREEN"; return; fi
  now=$(date +%s)
  remain=$(( resets - now ))
  [ "$remain" -lt 0 ] && remain=0
  [ "$remain" -gt "$win" ] && remain=$win
  elapsed_pct=$(( (win - remain) * 100 / win ))
  if [ "$elapsed_pct" -lt 2 ]; then  # window just reset; any usage is fine
    echo "$GREEN"; return
  fi
  # ratio in % of pace: 100 = exactly on pace
  local pace=$(( used * 100 / elapsed_pct ))
  if [ "$pace" -le 100 ]; then echo "$GREEN"
  elif [ "$pace" -le 125 ]; then echo "$YELLOW"
  else echo "$RED"; fi
}

color_effort() {
  case "$1" in
    low) echo "$GREEN";; medium) echo "$CYAN";; high) echo "$YELLOW";;
    xhigh) echo "$ORANGE";; max) echo "$RED";; *) echo "$GRAY";;
  esac
}

# --- Single jq pass: all fields, tab-separated, "-" for missing ---
IFS=$'\t' read -r current_dir model effort ctx_used cost lines_add lines_del \
  five_pct five_reset week_pct week_reset <<EOF
$(echo "$input" | jq -r '[
  (.workspace.current_dir // .cwd // "-"),
  (.model.display_name // "-"),
  (.effort.level // "-"),
  (.context_window.used_percentage // "-"),
  (.cost.total_cost_usd // "-"),
  (.cost.total_lines_added // "-"),
  (.cost.total_lines_removed // "-"),
  (.rate_limits.five_hour.used_percentage // "-"),
  (.rate_limits.five_hour.resets_at // "-"),
  (.rate_limits.seven_day.used_percentage // "-"),
  (.rate_limits.seven_day.resets_at // "-")
] | @tsv')
EOF

# --- host: • green = sandbox (orbstack/linux), gray = macos host ---
if [ "$(uname -s)" = "Darwin" ]; then seg_host="${GRAY}•${RESET}"
else seg_host="${GREEN}•${RESET}"; fi

# --- dir (worktree-aware) ---
if [ "$current_dir" != "-" ]; then
  if [[ "$current_dir" == *"/.claude/worktrees/"* ]]; then
    repo_root="${current_dir%%/.claude/worktrees/*}"
    folder_name="$(basename "$repo_root")/$(basename "$current_dir")"
  else
    folder_name=$(basename "$current_dir")
  fi
else
  folder_name="~"
fi
seg_dir="${BLUE}${BOLD}${folder_name}${RESET}"

# --- git: branch, dirty, ahead/behind ---
seg_git=""
if [ "$current_dir" != "-" ]; then
  branch=$(git -C "$current_dir" --no-optional-locks branch --show-current 2>/dev/null)
  if [ -n "$branch" ]; then
    dirty=""
    [ -n "$(git -C "$current_dir" --no-optional-locks status --porcelain 2>/dev/null | head -1)" ] && dirty=" *"
    ab=""
    counts=$(git -C "$current_dir" --no-optional-locks rev-list --left-right --count '@{u}...HEAD' 2>/dev/null)
    if [ -n "$counts" ]; then
      behind=${counts%%	*}; ahead=${counts##*	}
      [ "$ahead" -gt 0 ] 2>/dev/null && ab="$ab ⇡$ahead"
      [ "$behind" -gt 0 ] 2>/dev/null && ab="$ab ⇣$behind"
    fi
    if [ -n "$dirty" ]; then git_color=$YELLOW; else git_color=$PEACH; fi
    seg_git="${git_color}${branch}${dirty}${ab:+${GREEN}${ab}}${RESET}"
  fi
fi

# --- context ---
seg_ctx=""
if [ "$ctx_used" != "-" ]; then
  ctx_int=$(printf '%.0f' "$ctx_used")
  seg_ctx="$(color_pct "$ctx_int")${ctx_int}%${RESET}"
fi

# --- model + effort (one segment: "fable, high") ---
seg_model=""
if [ "$model" != "-" ]; then
  model_word=$(echo "${model%% *}" | tr '[:upper:]' '[:lower:]')
  seg_model="${GRAY}${model_word}"
  [ "$effort" != "-" ] && seg_model="${seg_model}, ${effort}"
  seg_model="${seg_model}${RESET}"
fi

# --- cost (only when nonzero) ---
seg_cost=""
if [ "$cost" != "-" ]; then
  cost_fmt=$(printf '%.2f' "$cost")
  [ "$cost_fmt" != "0.00" ] && seg_cost="${GRAY}\$${cost_fmt}${RESET}"
fi

# --- diff: lines added/removed this session ---
seg_diff=""
[ "$lines_add" != "-" ] && [ "$lines_add" != "0" ] && seg_diff="${GREEN}+${lines_add}${RESET}"
if [ "$lines_del" != "-" ] && [ "$lines_del" != "0" ]; then
  seg_diff="${seg_diff:+$seg_diff }${RED}-${lines_del}${RESET}"
fi

# --- rate limits: 5h absolute-colored, 7d pace-colored vs time-to-reset ---
seg_rate=""
if [ "$five_pct" != "-" ] || [ "$week_pct" != "-" ]; then
  seg_rate=""
  if [ "$five_pct" != "-" ]; then
    five_int=$(printf '%.0f' "$five_pct")
    if [ "$five_reset" != "-" ]; then
      five_color=$(color_pace "$five_int" "$five_reset" 18000)
    else
      five_color=$(color_pct "$five_int")
    fi
    seg_rate="${GRAY}5h:${five_color}${five_int}%${RESET}"
  fi
  if [ "$week_pct" != "-" ]; then
    week_int=$(printf '%.0f' "$week_pct")
    if [ "$week_reset" != "-" ]; then
      week_color=$(color_pace "$week_int" "$week_reset" 604800)
    else
      week_color=$(color_pct "$week_int")
    fi
    seg_rate="${seg_rate:+$seg_rate }${GRAY}7d:${week_color}${week_int}%${RESET}"
  fi
fi

# ============================ LAYOUT (flex) ==================================
# Claude Code sets COLUMNS to the terminal width (v2.1.153+). When known, lay
# segments out like flexbox space-between: drop by DROP_ORDER until everything
# fits at GAP_MIN, then spread the leftover width evenly into the gaps
# (capped at GAP_MAX so wide terminals don't look sparse).

DISPLAY_ORDER="host dir git ctx model cost diff rate"

plain_len() {  # visible length: strip ANSI escapes
  printf '%s' "$1" | sed $'s/\033\\[[0-9;]*m//g' | wc -m | tr -d ' '
}

# measure() → sets content=<total visible chars> nseg=<active segment count>
measure() {
  content=0; nseg=0
  local key val
  for key in $DISPLAY_ORDER; do
    eval "val=\$seg_$key"
    [ -z "$val" ] && continue
    content=$(( content + $(plain_len "$val") ))
    nseg=$(( nseg + 1 ))
  done
}

render() {  # $1 = flex gap width. LAYOUT=between: gap everywhere, first $rem
            # gaps get +1 col so the line lands flush on the right edge.
            # LAYOUT=split: GAP_MIN inside halves, $1 as the middle gap.
  local out="" key val i=0 split g mingap
  mingap=$(printf "%${GAP_MIN}s" "")
  split=$(( (nseg + 1) / 2 ))
  for key in $DISPLAY_ORDER; do
    eval "val=\$seg_$key"
    [ -z "$val" ] && continue
    if [ -z "$out" ]; then out="$val"
    elif [ "$LAYOUT" = "split" ] && [ "$i" -ne "$split" ]; then out="$out$mingap$val"
    else
      g=$1
      [ "$i" -le "$rem" ] && g=$(( g + 1 ))
      out="$out$(printf "%${g}s" "")$val"
    fi
    i=$(( i + 1 ))
  done
  printf '%s' "$out"
}

width=${COLUMNS:-$BUDGET}
width=$(( width - 4 ))  # safety margin: renderers cut trailing columns below this

# 1. drop segments until the line fits at minimum gap
measure
for key in $DROP_ORDER; do
  [ $(( content + (nseg - 1) * GAP_MIN )) -le "$width" ] && break
  eval "seg_$key=''"
  measure
done

# 2. flex: size the elastic gap(s) for the chosen layout
gap=$GAP_MIN; rem=0
if [ "$nseg" -gt 1 ]; then
  if [ "$LAYOUT" = "split" ]; then
    # one big middle gap absorbs all leftover width (uncapped)
    gap=$(( width - content - (nseg - 2) * GAP_MIN ))
    [ "$gap" -lt "$GAP_MIN" ] && gap=$GAP_MIN
  else
    # even gaps clamped to [GAP_MIN, GAP_MAX]; when uncapped, the first
    # `rem` gaps get +1 col to absorb the division remainder (flush right)
    gap=$(( (width - content) / (nseg - 1) ))
    if [ "$gap" -lt "$GAP_MIN" ]; then gap=$GAP_MIN
    elif [ "$gap" -ge "$GAP_MAX" ]; then gap=$GAP_MAX
    else rem=$(( width - content - gap * (nseg - 1) ))
    fi
  fi
fi

render "$gap"
