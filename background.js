// Copyright 2023 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.

// Service worker that listens to events when the workstation becomes active,
// idle or locked and sends it to Home Assistant.

import {getEntityState, setEntitySelectState} from "./common.js";

// Global configuration as stored in localStorage.
let config = null;
let lastState = null;

async function setEntityState(state) {
  lastState = state;
  if (config == null || !config.valid) {
    console.log("setEntityState(" + state + ") ignored due to invalid config");
    return;
  }
  // Silence errors, they are already logged.
  await setEntitySelectState(config.host, config.token, "input_select."+config.entity_id, state)
    .catch(() => {});
}

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (config == null) {
    // Race condition during initialization.
    return;
  }
  let otherThanValid = false;
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    otherThanValid = otherThanValid || (key != "valid");
    config[key] = newValue;
    // For debugging. Don't leak token in the log.
    if (key == "token") {
      oldValue = !!oldValue;
      newValue = !!newValue;
    }
    console.log("onChanged(" + namespace + "/" + key + ": " + JSON.stringify(oldValue) + "=>" + JSON.stringify(newValue) + ")");
  }
  // Don't test the config when valid is changed since it is changed by
  // ourselves. Everything else is changed by options.js.
  if (!otherThanValid) {
    return;
  }
  console.log("Got new config: " + JSON.stringify(config.host) + ", " + !!config.token + ", " + JSON.stringify(config.entity_id) + ", " + config.idle_timeout);
  let valid = false;
  try {
    if (config.host && config.token && config.entity_id) {
      // Ignore the result. When the input_select entity is created in Home
      // Assistant, it may not have a valid value initially.
      lastState = getEntityState(config.host, config.token, "input_select."+config.entity_id);
      console.log("Server returned: " + lastState);
      // The fact it worked is good enough.
      valid = true;
    }
  } catch (e) {
  }
  await chrome.storage.local.set({valid: valid});
  chrome.idle.setDetectionInterval(config.idle_timeout);
});

// https://developer.chrome.com/docs/extensions/reference/idle/
chrome.idle.onStateChanged.addListener(async (state) => {
  await setEntityState(state);
});

// Reload configuration on service worker startup. It remembers if the
// configuration was considered valid or not. We don't want to ping Home
// Assistant every single time the server worker is restarted.
chrome.storage.local.get(null).then((d) => {
  config = d;
  chrome.idle.setDetectionInterval(config.idle_timeout);
});

// Comment out when developing.
/*
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Resetting default values on install.");
  await chrome.storage.local.clear();
  let d = {
    host: "",
    token: "",
    // It'd be nice to default to the device's hostname but this is not available
    // outside enterprise deployments.
    // https://developer.chrome.com/docs/extensions/reference/enterprise_deviceAttributes/#method-getDeviceHostname
    entity_id: "",
    idle_timeout: 300,
    valid: false,
  }
  await chrome.storage.local.set(d);
  config = d;
});
*/

console.log("Service worker started");
