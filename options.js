// Copyright Marc-Antoine.

'use strict';

function createText(id, text, url) {
  let link = document.createElement("a");
  link.href = url;
  link.innerText = url;
  document.getElementById(id).appendChild(document.createTextNode(text));
  document.getElementById(id).appendChild(link);
}

async function testIfItWorks() {
  let host = document.getElementById("host");
  let token = document.getElementById("token");
  let entity_id = document.getElementById("entity_id");
  if (host.validity.valid && !token.validity.valid) {
    createText("token_help", "Generate one at ", host.value + "/profile");
  } else {
    document.getElementById("token_help").innerHTML = "";
  }
  document.getElementById("entity_id_help").innerHTML = "";
  if (!host.validity.valid || !token.validity.valid || !entity_id.validity.valid) {
    let elem = document.getElementById("result");
    elem.innerText = "";
    elem.classList.remove("failure");
    save("valid", false);
    return;
  }

  let url = host.value + "/api/services/input_select/select_option";
  let args = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token.value,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({entity_id: "input_select."+entity_id.value, option: "active"}),
  };
  let elem = document.getElementById("result");
  fetch(url, args)
    .then((resp) => resp.json())
    .then((data) => {
      elem.innerText = "Success!";
      elem.classList.remove("failure");
      // Tell background.js that the configuration is confirmed to be valid.
      save("valid", true);
      createText("entity_id_help", "See history at ", host.value + "/history?entity_id=input_select." + entity_id.value);
    }).catch((e) => {
      elem.innerText = e.message;
      elem.classList.add("failure");
      save("valid", false);
    });
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
  await [...document.getElementsByTagName("input")].forEach(async (elem) => {
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
  });

  await testIfItWorks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
