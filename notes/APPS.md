# Apps

## iFrame

We are going to code each app (docs, sheets, slides) as iFrames within the drive. That way we can simply iframe.postMessage({ identity }) data for our apps to use. Then we dont need to worry about `useIdentitySystem` reimplementation.

Note that this solution shouldn't be assumed safe for 3rd party apps. We still need to setup some ACL scope auth policies

## Routing

Apps will live at:

`https://drive.officex.app/org/current/apps/*`

For example:

- `/org/current/apps/docs`
- `/org/current/apps/sheets`
- `/org/current/apps/3rd-party-developer`

And we have our main subdomains redirect:

- `https://docs.officex.app/d/document_123abc` redirects to `https://drive.officex.app/org/external/apps/docs/document_123abc`
- `https://sheets.officex.app/d/sheets_123abc` redirects to `https://drive.officex.app/org/external/apps/sheets/sheets_123abc`

Note that plain storage will still live at:

`https://drive.officex.app/org/current/drive/folderID/fileID` with a UI button to "open in app". This lets us still use that route page to show file metadata and not break drive ui patterns.

## Saving

Each app manages save its own way. The outer iFrame passes in the user auth.
