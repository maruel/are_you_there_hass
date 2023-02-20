// Copyright 2022 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.

let logCopy = console.log;
Object.defineProperty(console, "log", {
  get: function () { return Function.prototype.bind.call(logCopy, console, `[${new Date().toISOString()}]`); }
});
let errorCopy = console.error;
Object.defineProperty(console, "error", {
  get: function () { return Function.prototype.bind.call(errorCopy, console, `[${new Date().toISOString()}]`); }
});


export async function getEntityState(host, token, entity_id) {
  console.log("getEntityState(" + host + ", ..., " + entity_id + ")");
  let url = host + "/api/states/" + entity_id;
  let args = {
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
  };
  return fetch(url, args)
    .then((resp) => resp.json())
    .then((data) => {
      // Uncomment to debug issues:
      //console.log(data);
      if ("message" in data) {
        // Normally "Entity not found.".
        throw data["message"];
      }
      return data["state"];
    }).catch((e) => {
      // Uncomment to debug issues:
      //console.error(e);
      throw e;
    });
}


export async function setEntitySelectState(host, token, entity_id, state) {
  console.log("setEntitySelectState(" + host + ", ..., " + entity_id + ", " + state + ")");
  if (!entity_id.startsWith("input_select.")) {
    console.error("invalid entity name " + entity_id);
    return;
  }
  let url = host + "/api/services/input_select/select_option";
  let args = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({entity_id: entity_id, option: state}),
  };
  return fetch(url, args)
    // Keeping the JSON decoding to ensure the returned data is valid JSON.
    .then((resp) => resp.json())
    // On 400 Bad Request, text (not JSON) is returned. Use this instead in this
    // case.
    //.then((resp) => resp.text())
    .then((data) => {
      // Uncomment to debug issues:
      //console.log(data);
      return data;
    }).catch((e) => {
      console.error(e);
      throw e;
    });
}
