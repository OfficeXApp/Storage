# Developer To Do

## Todo

- [🔵] Contacts crud routes (with redux-offline)
- [ ] Teams & Team Invite creation routes (with redux-offline)
- [ ] Magic login link with redeem placeholders (both for contacts themselves, and via team invite, also FactorySpawnOrgResponseData). replace password login scheme string, with a btoa password (before: "DriveID_abc123:password123@https://endpoint.com", after: RHJpdmVJRF9...dC5jb20) url safe ?password=btoa

- [ ] Support multi offline organizations
- [ ] Investigate & consolidate auth cookies
- [ ] Investigate & consolidate all indexdb databases

## Backlog

- [ ] Regenerate REST API docs & types with new routes, `/organization/whoami`, `/organization/superswap_user`
- [ ] In organization settings, for current user, ability to change the api key
- [ ] User initiated superswap_userid as a form of account "recovery" when they've lost/compromised their seed phrase. This should be added as a permission with grantee being a user/team etc.

## Done

- [x] Make sure switch users will persist who the current user is, so that upon browser restart its seamless to get user back in
- [x] Setup multi-organizations
- [x] Setup default profile per organization, UX sugar (can just be most recent)
- [x] Setup API keys for organization <> profile with /organization/whoami
- [x] Factory deploy drive, connect to frontend
- [x] Contacts UI pages
