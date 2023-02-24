// Copyright 2023 Marc-Antoine Ruel. All rights reserved.
// Use of this source code is governed under the Apache License, Version 2.0
// that can be found in the LICENSE file.

// Javascript module used by both background.js and options.js.

let logCopy = console.log;
Object.defineProperty(console, "log", {
  get: function () { return Function.prototype.bind.call(logCopy, console, `[${new Date().toLocaleString('zh-CN')}]`); }
});
let errorCopy = console.error;
Object.defineProperty(console, "error", {
  get: function () { return Function.prototype.bind.call(errorCopy, console, `[${new Date().toLocaleString('zh-CN')}]`); }
});


export async function callWebhook(webhook, state) {
  console.log("callWebhook(" + webhook + ", " + state + ")");
  let args = {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({"state": state}),
  };
  return await fetch(webhook, args)
      .catch((e) => {
        console.error(e);
        throw e;
      });
}
