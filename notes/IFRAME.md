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

  // Wait for iframe to load before sending messages
  iframe.addEventListener("load", () => {
    iframe.contentWindow.postMessage(
      {
        type: "init",
        data: {
          // ephemeral
          // starts here permissionlessly
          ephemeral: {
            orgSeed: "your-org-seed-phrase", // this can be an arbitrary string
            profileSeed: "your-profile-seed-phrase", // this can be a user id from your db
          },
          cloud: {
            // if using existing cloud, the child iframe will check if the user has approved the connection (allowlist the host domain - the allowlist lives in officex drive ui indexdb identity framework, pure clientside)
            // if using existing cloud is not provided, the child iframe will issue a popup to allow parent domain to add this org+profile to your officex
            host: "your-custom-backend", // this can be an arbitrary string
            orgID: "your-drive-id", // this can be an arbitrary string
            profileID: "your-profile-id", // this can be an arbitrary string
            // only provide apiKey if you are subsidizing for users
            apiKey: "your-api-key" // omit if you are using their existing profile
          },
        },
        tracer: "init-example"
      },
      "*"
    );
  });

  // Listen for messages from IFrame
  window.addEventListener("message", (event) => {
    // Validate origin for security
    if (event.origin !== "https://drive.officex.app") return;

    const { type, data, tracer } = event.data;

    // Handle responses based on tracer
    switch (tracer) {
      case "init-example":
        console.log("Init response:", data);
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
    }
  });

  // Go to Page
  iframe.contentWindow.postMessage(
    {
      type: "go-to-page",
      data: { ... }, // url is sanitized by child to only apply to /org/current/*
      tracer: "go-to-page-action01"
    },
    "*"
  );


  // WhoAmI
  iframe.contentWindow.postMessage(
    {
      type: "whoami",
      data: { ... },
      tracer: "whoami-action04"
    },
    "*"
  );

  // Get Auth Token
  iframe.contentWindow.postMessage(
    {
      type: "getAuthToken",
      data: { ... },
      tracer: "getAuthToken-action05"
    },
    "*"
  );
</script>
```

### Child POV (IFrame OfficeX)

Implementation Work:

☑️ Implement iframe.postMessage handlers & tracer update results
☑️ Add allowlistDomains to the officex drive ui indexdb identity framework, pure clientside
☑️ Implement init flow for ephemeral org+profile
☑️ Implement init flow for cloud org+profile
☑️ Implement approval flow & popup for existing allowlisted domains
☑️ Implement switchOrg flows
☑️ Implement whoami flows
☑️ Implement getAuthToken flows
☑️ Implement go-to-url flows for redeem disk
☑️ Implement iframe pages showing example usage
