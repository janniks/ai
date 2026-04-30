> This file is meant for agents.

You are supposed to do the following (assumung Ubuntu server, do similar steps for other distros)

## 1. Install essentials

`tmux`, `git`, `mosh`, `node`

## 2. Update configs

Update exisiting configs or create new files.

### tmux

```
set -g mouse on

# Slow down mouse scrolling (2 lines per tick instead of default 5)
bind -T copy-mode-vi WheelUpPane send-keys -X -N 1 scroll-up
bind -T copy-mode-vi WheelDownPane send-keys -X -N 1 scroll-down
bind -T copy-mode WheelUpPane send-keys -X -N 1 scroll-up
bind -T copy-mode WheelDownPane send-keys -X -N 1 scroll-down
```

### bash

Uncomment for a colored prompt, if the terminal has the capability

`force_color_prompt=yes`

## 3. Harden server

Ask user first [y/N]

### 3.1 UFW baseline

MUST run before §3.3 (SSH lockdown) — otherwise lockout risk.

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 60000:61000/udp # mosh
ufw enable
```

### 3.3 SSH

Backup first:

```bash
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
```

Edit /etc/ssh/sshd_config:

```bash
PermitEmptyPasswords no
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
```

Test config, then reload:

```bash
sshd -t && systemctl reload ssh
```

Open a SECOND session and verify login before closing the first.

3.4 Postfix

Only if Postfix is installed and mail is local-only (cron, logwatch).

Edit /etc/postfix/main.cf:

inet_interfaces = loopback-only

Then:

systemctl restart postfix

3.5 App services

Bind app services (e.g. next-server on 3000, python services on 4000) to 127.0.0.1 instead
of \*. Caddy / nginx reverse-proxies them, so external bind is unnecessary.

3.6 Password aging

Edit /etc/login.defs:

PASS_MAX_DAYS 90
PASS_MIN_DAYS 1
PASS_WARN_AGE 7

Apply to existing users:

chage --maxdays 90 <name>

3.7 Kernel sysctl

Create /etc/sysctl.d/99-hardening.conf:

net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

Then:

sysctl --system

3.8 Unattended upgrades

dpkg-reconfigure -plow unattended-upgrades

Confirm /etc/apt/apt.conf.d/20auto-upgrades has APT::Periodic::Unattended-Upgrade "1";.

3.9 Verify

fail2ban-client status sshd
ls /var/log/unattended-upgrades/
ufw status
ss -tlnp

Confirm:

- sshd jail enabled with sensible bantime / maxretry
- unattended-upgrades has recent runs
- only 22/80/443/mosh exposed
- no app services bound to 0.0.0.0 except sshd / caddy / postfix
- mosh connects end-to-end (if used)

```

```
