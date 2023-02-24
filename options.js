// Copyright 2023 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.

// Code for options.html.

import {callWebhook} from "./common.js";

async function testIfItWorks() {
  console.log("testIfItWorks()");
  let result = document.getElementById("result");
  let webhook = document.getElementById("webhook");
  result.classList.remove("failure");
  if (!webhook.checkValidity()) {
    result.innerText = "";
    return false;
  }
  result.innerText = "Testing...";

  try {
    let data = await callWebhook(webhook.value, "active");
  } catch(e) {
    result.innerText = e.message;
    result.classList.add("failure");
    return false;
  }
  result.innerText = "Success!";
  result.classList.remove("failure");
  return true;
}

async function load(name) {
  if ("storage" in chrome) {
    return await chrome.storage.local.get(name).then((o) => o[name]);
  }
  // When testing locally as a standalone page.
  return localStorage.getItem(name);
}

async function save(name, value) {
  if ("storage" in chrome) {
    let o = {};
    o[name] = value;
    await chrome.storage.local.set(o);
  } else {
    // When testing locally as a standalone page.
    localStorage.setItem(name, value);
  }
}

async function saveElem(elem) {
  let n = elem.getAttribute("name");
  if (elem.type === "number") {
    await save(n, elem.valueAsNumber);
  } else {
    await save(n, elem.value);
  }
}

async function init() {
  let elems = document.getElementsByTagName("input");
  for (let i = 0; i < elems.length; i++) {
    let elem = elems[i];
    // Load settings.
    let n = elem.getAttribute("name");
    let v = await load(n);
    if (v) {
      elem.value = v;
    } else if (elem.value) {
      await saveElem(elem);
    }
    // Save settings on change.
    elem.addEventListener("change", async (e) => {
      await saveElem(elem);
    });
    elem.addEventListener("focusout", async (e) => {
      await testIfItWorks();
    });
  }
  await testIfItWorks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
