// Copyright Marc-Antoine.

'use strict';

const timestamp = () => `[${new Date().toISOString()}]`;
const error = (...args) => console.error(timestamp(), ...args);
function log(...args) {
  // Uncomment to debug:
  //console.log(timestamp(), ...args);
}

// Example values. Are overridden at load.
let config = {
  // It's recommended to have a valid external https:// domain for a laptop.
  host: "http://homeassistant.local:8123",
  // It'd be nice to default to the device's hostname but this is not available
  // outside enterprise deployments.
  // https://developer.chrome.com/docs/extensions/reference/enterprise_deviceAttributes/#method-getDeviceHostname
  entity_id: "laptop",
  // Minimum is 15s.
  // Note: A service worker stop the service worker once it idles for a short
  // period (30s).
  // https://developer.chrome.com/docs/extensions/mv3/service_workers/#manifest
  idle_timeout: 300,
  // Generate from http://homeassistant.local/profile
  token: "",
  // options.js sets it to true once it confirmed it can send a request to Home
  // Assistant.
  valid: false,
};

async function setEntityState(state) {
  if (!config.valid) {
    log("State: " + state + "(not sending)");
    return;
  }
  log("State: " + state);
  let url = config.host + "/api/services/input_select/select_option";
  let args = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + config.token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({entity_id: "input_select."+config.entity_id, option: state}),
  };
  await fetch(url, args)
    // Keeping the JSON decoding to ensure the returned data is valid JSON.
    .then((resp) => resp.json())
    .then((data) => {
      log(data);
    }).catch(error);
}

async function load() {
  config = await chrome.storage.local.get(null);
  log(config);
  if (config.valid && config.idle_timeout) {
    chrome.idle.setDetectionInterval(config.idle_timeout);
    setEntityState("active");
  }
}

load();
chrome.storage.onChanged.addListener((changes, namespace) => {
  load();
});
// https://developer.chrome.com/docs/extensions/reference/idle/
chrome.idle.onStateChanged.addListener(async (state) => {
  setEntityState(state);
});
