// Copyright 2022 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.

import {setEntitySelectState} from "./common.js";

function createText(id, text, url) {
  let link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.innerText = url;
  document.getElementById(id).appendChild(document.createTextNode(text));
  document.getElementById(id).appendChild(link);
}

async function testIfItWorks() {
  console.log("testIfItWorks()");
  let result = document.getElementById("result");
  result.innerText = "Testing...";
  let host = document.getElementById("host");
  let token = document.getElementById("token");
  let entity_id = document.getElementById("entity_id");
  if (host.validity.valid && !token.validity.valid) {
    createText("token_help", "Generate one at ", host.value + "/profile");
  } else {
    document.getElementById("token_help").innerHTML = "";
  }
  document.getElementById("entity_id_help").innerHTML = "";
  let items = [];
  if (!host.checkValidity()) {
    items.push("host");
  }
  if (!token.checkValidity()) {
    items.push("token");
  }
  if (!entity_id.reportValidity()) {
    items.push("entity_id");
    if (host.reportValidity()) {
      createText("entity_id_help", "See entities at ", host.value + "/config/entities");
    }
  }
  if (items.length) {
    result.innerText = "Waiting on valid " + items.join(", ") + " data";
    result.classList.remove("failure");
    save("valid", false);
    console.log("testIfItWorks() skipped");
    return;
  }

  await setEntitySelectState(host.value, token.value, entity_id.value, "active")
    .then((data) => {
      result.innerText = "Success!";
      result.classList.remove("failure");
      // Tell background.js that the configuration is confirmed to be valid.
      save("valid", true);
      createText("entity_id_help", "See history at ", host.value + "/history?entity_id=input_select." + entity_id.value);
    }).catch((e) => {
      result.innerText = e.message;
      result.classList.add("failure");
      save("valid", false);
    });
  console.log("testIfItWorks() done");
}

async function load(name) {
  if ("storage" in chrome) {
    return await chrome.storage.local.get(name).then((o) => o[name]);
  }
  return localStorage.getItem(name);
}

async function save(name, value) {
  if ("storage" in chrome) {
    let o = {};
    o[name] = value;
    await chrome.storage.local.set(o);
  } else {
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
