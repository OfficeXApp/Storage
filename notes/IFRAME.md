# IFrame Integration

The iFrame integration allows drop-in UI for OfficeX, orgs+profiles scoped by default to your domain, but also possible to request permission to other domains. For actual programmatic use without iframe ui, use the authToken with REST API.

## Basic Setup

### Parent POV

```html
<h1>Parent Document</h1>
<iframe
  id="officex-iframe"
  src="https://drive.officex.app"
  width="100%"
  height="600px"
></iframe>
<script>
  // Init IFrame
  const iframe = document.getElementById("officex-iframe");

  // Configuration for initialization

  // Configuration for initialization
  const initConfig = {
    ephemeral: {
      org_client_secret: "your-org-seed-phrase", // this can be an arbitrary string
      profile_client_secret: "your-profile-seed-phrase", // this can be a user id from your db
      org_name: "your-org-name", // this can be an arbitrary string
      profile_name: "your-profile-name", // this can be an arbitrary string
    },
    injected: {
      host: "your-custom-backend", // this can be an arbitrary string
      orgID: "your-drive-id", // this can be an arbitrary string
      profileID: "your-profile-id", // this can be an arbitrary string
      apiKey: "your-api-key", // only provide apiKey if you are subsidizing for users
      redirectTo?: "org/current/drive" // optional, default is the drive path
    },
    // no longer needed
    // existing: {
    //     // shows ui page asking user to approve connection, and select api key to give parent app access to
    //   orgID: "your-drive-id", // this can be an arbitrary string
    //   profileID: "your-profile-id", // this can be an arbitrary string
    //   redirectTo?: "org/current/drive" // optional, default is the drive path
    // }
  };

  // Function to initialize the iframe
  function initializeIframe() {
    iframe.contentWindow.postMessage(
      {
        type: "init",
        data: initConfig,
        tracer: "init-example",
      },
      "*"
    );
  }

  // Wait for iframe to load before sending messages
  // This event fires on both initial load AND refresh
  iframe.addEventListener("load", () => {
    console.log("IFrame loaded/refreshed - initializing...");
    // Add a small delay to ensure iframe is fully ready
    setTimeout(initializeIframe, 100);
  });

  // Listen for messages from IFrame
  window.addEventListener("message", (event) => {
    // Validate origin for security
    // if (event.origin !== "https://drive.officex.app") return;

    const { type, data, tracer } = event.data;

    // Handle responses based on tracer
    switch (tracer) {
      case "init-example":
        console.log("Init response:", data);
        if (data.success) {
          console.log("IFrame initialized successfully");
        } else {
          console.error("IFrame initialization failed:", data.error);
          // Optionally retry initialization after a delay
          setTimeout(initializeIframe, 2000);
        }
        break;

      case "go-to-page-action01": // often used to navigate to a redeem gift card page
        console.log("Go to page url response:", data);
        break;

      case "whoami-action04":
        console.log("WhoAmI response:", data); // contains info about disks so its easy to show a default drive url
        break;

      case "getAuthToken-action05":
        console.log("Auth token response:", data);
        break;

      case "rest-command-action06":
        console.log("Rest command response:", data);
        break;
    }
  });

  // Helper function to send messages to iframe
  function sendMessageToIframe(type, data, tracer) {
    if (!iframe.contentWindow) {
      console.warn("IFrame not ready");
      return;
    }
    iframe.contentWindow.postMessage({ type, data, tracer }, "*");
  }

  // Go to Page
  function goToPage(pageData) {
    sendMessageToIframe("go-to-page", pageData, "go-to-page-action01");
  }

  // WhoAmI
  function whoAmI() {
    sendMessageToIframe("whoami", {}, "whoami-action04");
  }

  // Get Auth Token
  function getAuthToken() {
    sendMessageToIframe("getAuthToken", {}, "getAuthToken-action05");
  }

  // Send Rest Command
  function sendRestCommand(commandData) {
    sendMessageToIframe("rest-command", commandData, "rest-command-action06");
  }
</script>
```

## Iframe Refresh Detection

The iframe automatically reinitializes when it refreshes because:

1. **Load Event Detection**: The `load` event fires both on initial load and refresh
2. **Automatic Reinitialization**: When the load event fires, the parent automatically sends the init message
3. **Error Handling**: If initialization fails, the parent can retry after a delay
4. **State Persistence**: The parent maintains the initialization configuration to reuse on refresh

### Key Features for Refresh Handling

- **Persistent Configuration**: Store your init config in the parent scope so it's available for reinitialization
- **Load Event Listener**: Always listen for the `load` event, which covers both initial load and refreshes
- **Retry Logic**: Implement retry logic in case initialization fails after a refresh
- **Timing Considerations**: Add a small delay after load to ensure the iframe is fully ready

### Child POV (IFrame OfficeX)

Implementation Work:

✅ Add allowlistDomains as a server side attribute of canisters
✅ Implement iframe.postMessage handlers & tracer update results
✅ Implement init flow for ephemeral org+profile
✅ Handle reinitialization on iframe refresh/reload events
✅ Implement whoami flows

Due to browser security, the child iframe doesnt actually have access to the same local device storage as direct on officex.app. Which means we will never even need the "grant agentic key" flow on frontend. How we do grant iframe easy access to existing profiles? maybe we cant... maybe it needs to be an explicit API key copy paste for those 3rd party apps. At best those 3rd party apps inject API auth creds into the iframe, and they can switch between any org since its all scoped to their domain so all accounts are theirs.

Yes upon further thought, we still need a 'grant agentic key' flow as a single easy url for 3rd party apps to send to, and after granting agentic key access the page is redirected back to 3rd party app with the apikey in the url params. This is like traditional auth confirm flows.

Say we want to escape the confines of the parent iframe, then we also need an "auto-login" url containing all the necessary auth info to connect to officex.app on seperate browser. the local device memory would be seperated, but the cloud can sync the two clients.

And finally the parent app sponsored injection of creds into child iframe. Allowing any arbitrary set of orgs.

☑️ Implement getAuthToken flows (what is the appropriate flow?) - where should we store api-keys for outer domain flows? we probably should create a new indexdb table for just storing `domain:org:profile:api-key` pairs, and users must manually switch to a specific profile to connect (unless providing a sponsored profile)
☑️ Implement init flow for auto-login parent sponsored cloud org+profile (parent provides apikey) - same url should be openable on new tab on officex.app directly
☑️ Implement init flow for permit access to existing org+profile, parent does NOT pass apiKey, user is taken through a flow to create an api-key for the parent iframe (or select existing api-key). user may have to switch to a specific profile to connect
☑️ Do we even need Add allowlistDomains to the officex drive ui indexdb identity framework, pure clientside?

☑️ Implement go-to-url flows for redeem disk
☑️ Implement iframe pages showing example usage
☑️ Remove frontend code dependencies on localstorage (only use IndexedDB for identity framework on every unique tab or iframe) - this is preventing parallel tabs with different identities. it can also generate bugs on org-specific url routes as the url (eg. /org/current/\*)
☑️ Allow canister rest api to accept `raw_url` on create file (simplify to not need subsequent update file)
☑️ Update Files & Folders to have a notes field for display. this will be important for file attribution to 3rd party apps
☑️ Fix scrollability in drive ui / filepage
