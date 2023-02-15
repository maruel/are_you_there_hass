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


export async function setEntitySelectState(host, token, entity_id, state) {
  console.log("State: " + state);
  let url = host + "/api/services/input_select/select_option";
  let args = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({entity_id: "input_select."+entity_id, option: state}),
  };
  return fetch(url, args)
    // Keeping the JSON decoding to ensure the returned data is valid JSON.
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
    }).catch((e) => {
      console.error(e);
      throw e;
    });
}
