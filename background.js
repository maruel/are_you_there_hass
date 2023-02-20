// Copyright 2022 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.


import {getEntityState, setEntitySelectState} from "./common.js";


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
};

function isConfigValid() {
  try {
    // Ignore the result, the fact it worked is good enough. When the variable
    // is created it may not have a valid value initially.
    getEntityState(config.host, config.token, "input_select."+config.entity_id);
    return true;
  } catch (e) {
    return false;
  }
}

async function setEntityState(state) {
  // Silence errors, they are already logged.
  await setEntitySelectState(config.host, config.token, "input_select."+config.entity_id, state)
    .catch(() => {});
}

async function load() {
  config = await chrome.storage.local.get(null);
  console.log("Got new config");
  if (isConfigValid() && config.idle_timeout) {
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
