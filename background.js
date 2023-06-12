// Copyright 2023 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.

// Service worker that listens to events when the workstation becomes active,
// idle or locked and sends it to Home Assistant.

import {callWebhook} from "./common.js";

// Global configuration as stored in localStorage.
let config = null;
// Last state as retrieved by chrome.idle, to be resent when network changes.
let lastState = "idle";

async function setEntityState(state) {
  if (config == null || !config.webhook) {
    console.log("setEntityState(" + state + ") ignored due to invalid config");
    return;
  }
  // Silence errors, they are already logged.
  await callWebhook(config.webhook, state).catch(() => {});
}

chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (config == null) {
    // Race condition during initialization.
    return;
  }
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    config[key] = newValue;
    console.log("onChanged(" + namespace + "/" + key + ": " + JSON.stringify(oldValue) + "=>" + JSON.stringify(newValue) + ")");
  }
  console.log("Got new config: " + JSON.stringify(config.webhook) + ", " + config.idle_timeout);
  if (config.idle_timeout >= 15) {
    chrome.idle.setDetectionInterval(config.idle_timeout);
  }
});

// https://developer.chrome.com/docs/extensions/reference/idle/
chrome.idle.onStateChanged.addListener(async (state) => {
  lastState = state;
  await setEntityState(state);
});

// Reload configuration on service worker startup. We don't want to ping Home
// Assistant every single time the server worker is restarted.
chrome.storage.local.get(null).then((d) => {
  if (!d) {
    d = {
      webhook: "",
      idle_timeout: 30,
    }
    // Don't wait.
    chrome.storage.local.set(d);
  }
  config = d;
  if (config.idle_timeout >= 15) {
    chrome.idle.setDetectionInterval(config.idle_timeout);
  }
});

// https://devdocs.io/dom/networkinformation/change_event
navigator.connection.addEventListener("change", function() {
  if (navigator.onLine) {
    // Opportunistically tries to send an update when network comes back online.
    // This can also help in scenarios like when network is over Ethernet over a
    // Thunderbolt 4 dock, which may take a few seconds to initialize.
    setTimeout(async function() {
      await setEntityState(lastState);
    }, 5000);
  }
});

/*
// Comment out when developing.
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Resetting default values on install.");
  await chrome.storage.local.clear();
  let d = {
    webhook: "",
    idle_timeout: 300,
  }
  await chrome.storage.local.set(d);
  config = d;
});
*/

console.log("Service worker started");
