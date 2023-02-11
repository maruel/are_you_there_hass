# Chrome Extension to report desktop lock state to Home Assistant

Reports to Home Assistant when your laptop/workstation user session is active,
locked or idle. While it works on any OS, it is particularly useful for
ChromeOS. You can then automate turning on or off the lights when you
unlock/lock your workstation, or [automate your
chair](https://github.com/maruel/emperor-esp8266).


## Setup

### 1. Home Assistant configuration

In your Home Assistant `configuration.yaml`, add

```
# https://www.home-assistant.io/integrations/api
api:

# https://www.home-assistant.io/integrations/http
http:
  cors_allowed_origins:
  - "*"
  https://www.home-assistant.io/components/http/#ip_ban_enabled
  ip_ban_enabled: true
  login_attempts_threshold: 3

# https://www.home-assistant.io/integrations/input_select
input_select:
  workstation_1:
    name: "Workstation 1"
    options:
      - idle
      - active
      - locked
    icon: mdi:eye-lock-open-outline
  laptop_2:
    name: "Laptop 2"
    options:
      - idle
      - active
      - locked
    icon: mdi:eye-lock-open-outline
```

replacing workstation and laptop with entity names of your choice. Add as many
as you want.

The IP ban is optional but recommended. If an IP gets incorrectly banned while
testing, zap out `ip_bans.yaml` and restart Home Assistant.


### Extension

Install the extension.

- Set the URL to your Home Assistant server.
- Create a long lived token. The UI to do this is at the bottom of your profile
  page in the Web UI.
- Use the entity name that you specified in `configuration.yaml`.

Repeat once per desktop/laptop.

You're good to go to automate!


## Icon

Source: https://pictogrammers.com/library/mdi/icon/eye-lock-open-outline/
created by [Michael Irigoyen](https://pictogrammers.com/contributor/mririgoyen/).

```
convert eye-lock-open-outline.png -resize 128x128 eye-lock-open-outline-128.png
pngcrush -ow eye-lock-open-outline-128.png
```
