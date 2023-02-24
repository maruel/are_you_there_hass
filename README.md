# Are you there? Hass

**TL;DR:** Turn on the lights when you unlock your desktop/laptop.

_Are you there? Hass_ is a Chrome extension that reports to [Home
Assistant](https://home-assistant.io) when your desktop/laptop user session is
active, locked or idle. While it works on any OS, it is particularly useful for
ChromeOS.

Home Assistant can then be automated when you unlock/lock your desktop/laptop to
turn on/off the lights, or in the extreme case [automate your
chair](https://github.com/maruel/emperor-esp8266). You can even use it to
calculate how much you worked.

## Setup

### 1. Home Assistant configuration

In your Home Assistant `configuration.yaml`, add a [template triggered via a
webhook](https://www.home-assistant.io/integrations/template/#sensor):

```
# https://www.home-assistant.io/integrations/http
http:
  cors_allowed_origins:
  - "*"

# https://www.home-assistant.io/integrations/template/
template:
  - trigger:
      - platform: webhook
        webhook_id: laptop_1_ABCDEF
    sensor:
      - name: "Laptop 1"
        unique_id: laptop_1
        state: "{{trigger.json.state}}"
  - trigger:
      - platform: webhook
        webhook_id: bigger_laptop_2_GHIJKL
    sensor:
      - name: "Bigger Laptop 2"
        unique_id: bigger_laptop_2
        state: "{{trigger.json.state}}"
        icon: mdi:eye-lock-open-outline
```

replacing "laptop_1" (entity id) and "Laptop 1" (display name) with entity names
of your choice. Add as many desktops as you want! ABCDEF should be a random >=32
characters string.


### 2. Extension

- Install the extension.
- Set the URL to your Home Assistant server webhook in the form
  http://host:port/api/webhook/<webhook_id>.

You're good to go to automate!


## Build

This project was developed in [Vanilla JS](http://vanilla-js.com)! There's
nothing to build. You can load this directory as-is as an unpacked extension!


## Testing

```
curl -XPOST -sS \
  -H "Content-Type: application/json" \
  -d '{"state":"locked"}' \
  http://homeassistant.local:8123/api/webhook/laptop_1_ABCDEF
```

## Icon

Source: https://pictogrammers.com/library/mdi/icon/eye-lock-open-outline/
created by [Michael Irigoyen](https://pictogrammers.com/contributor/mririgoyen/).

```
convert eye-lock-open-outline.png -resize 128x128 eye-lock-open-outline-128.png
pngcrush -ow eye-lock-open-outline-128.png
```
