# Are you there? Hass

**TL;DR:** Turn on the lights when you unlock your desktop/laptop.

_Are you there? Hass_ is a Chrome extension that reports to [Home
Assistant](https://home-assistant.io) when your desktop/laptop user session is
active, locked or idle. While it works on any OS, it is particularly useful for
ChromeOS.

Home Assistant can then be automated when you unlock/lock your desktop/laptop to
turn on/off the lights, or in the extreme case [automate your
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

If you use
[ip_ban_enabled](https://www.home-assistant.io/integrations/http/#ip_ban_enabled),
it is possible that the IP may get banned while configuring. If an IP gets
incorrectly banned while testing, zap out
[`ip_bans.yaml`](https://www.home-assistant.io/integrations/http/#ip-filtering-and-banning)
and restart Home Assistant.


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
