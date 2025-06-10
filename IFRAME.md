# iFrame Integration Option

OfficeX Developer Docs

While OfficeX provides a full REST API, sometimes you may only need something simplier such as:

1. An Ephemeral UI (easy UI component in your app)
2. Zero cost implementation (no gas fees, no server costs)
3. Demand a permissionless integration (ready in 2 mins)

For such cases, we provide a simple iframe integration. For example, you have a parent website `youtubedownloader.com`. You can add OfficeX drive into your app like so:

```html
<iframe
  id="my-officex-iframe-01"
  src="drive.officex.app"
  orgID="optional-on-demand-org-id"
  profileID="optional-on-demand-profile-id"
></iframe>
```

This is the bare minimum, you can let the OfficeX iframe take care of the rest.

You might also want to programmatically handle stuff on your app. You can do so by using `postMessage` to send messages to the iframe like so:

```js
// reference the iframe
const OfficeX = document.getElementById("my-officex-iframe-01")

// use rest api on offline offchain officex
const payload = { route: “POST/createFolder”, body: {…} }
OfficeX.postMessage(JSON.stringify(payload))

// optional file upload via iframe
const upload = { route: “POST/uploadFileChunk, body: {…} }
OfficeX.postMessage(JSON.stringify(upload))
```

The entire integration can work without 3rd party libraries, however we also provide convenience embed script:

```html
<!-- Optional Script, everything can be done without this too -->
<script src="https://cdn.officex.app/optional-lib.js"></script>
```

which exposes global variable on frontend `window.officex`

so that you can:

```js
window.officex.uploadFile(FileRaw, { ...destinationInfo });
```

The combo of `iframe.postMessage` and `window.officex` makes for an extremely simple permissionless integration with 3rd party apps in an offline offchain decentralized manner.

Your users can see everything on your website or app without navigating to drive.officex.app. They can also go to drive.officex.app and see everything there too.

For security purposes, we restrict programmatic access to only orgs & profiles created by parent domain. Users may also choose to add an ACL list of domains to permit programmatic iframe control.

For advanced full depth functionality, check out our [REST API](https://dev.officex.app)
