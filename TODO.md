# Developer To Do

## Overview

- [ ] Trash bin functionality
- [ ] Edit file/folder name
- [ ] Delete file folder / Restore trash / Delete forever

- [ ] Fix bug where uploading large files to canister will succeed but appear blue progress bar stuck
- [ ] Fix optimistic vs actual load positioning (order of rows may change and result in jarring experience)
- [ ] Pretty short links `drive.officex.app/r/uuid-redirects-to-long-form`

- [ ] Refactor drive ui back button to actually check parent folder to navigate grandfather
- [ ] Update list directory call with a permissioned full path checker (for driveui breadcrumbs)
- [ ] Add 404 Pages
- [ ] Ability to offline create disks, folders, etc (when offline create disk, its missing root folder & trash folder)

1. Directory navigation & interaction (1-2 days)
1. Offline JS functionality replica (1-2 days)
1. Cleaning & testing all the crud routes together (2-3 days)
1. UI polish before prod (1-2 days)
   - api key tab, change edit to manage and put inside edit & revoke. the current place where revoke it, change to "Login As"
   - hyperlink resources on UI for ease of navigation

## Polish Checklist

- [ ] Implement "Default Disk" and hide disks
- [ ] Back button on /drive for when new user arrives
- [ ] When adding a new org, dont just refresh page, go to /contacts just in case
- [ ] Default offline contacts / api keys
- [ ] Fix bugs when removing an org or profile, proper redirects, etc
- [ ] Refactor settings page
- [ ] Smart sidemenu nav opens closes based on which page
- [ ] Clear optimistic cache when 401 unauthorized
- [ ] Cache bug where switching from owner to anon account, the anon seems to copy cache of admin... investigate
- [ ] Switching orgs doesnt immediately load resources despite listening for it in useEffect App.tsx. check cache issues
- [ ] Fix all the places where .replace() doesnt use proper regex match all

## Todo

- [🔵] Figure out a unified tag framework --> `{nickname}:{id}@`
- [🔵] Implement permissions on frontend (redux, reuseable ui pickers, crud)
- [🔵] Blitzkreig the rest of the crud routes?
- [🔵] Blitzkreig the rest of the crud UI?
- [🔵] Groups & Group Invite creation routes (with redux-offline)
- [ ] Handle folder copy logic where subfiles wont have a known ID, so the type FolderFEO.sync_warning = string should help us warn the user
- [ ] Magic login link with redeem placeholders (both for contacts themselves, and via group invite, also FactorySpawnOrgResponseData). replace password login scheme string, with a btoa password (before: "DriveID_abc123:password123@https://endpoint.com", after: RHJpdmVJRF9...dC5jb20) url safe ?password=btoa
- [ ] Support multi offline organizations
- [ ] Investigate & consolidate auth cookies
- [ ] Investigate & consolidate all indexdb databases

## Backlog

- [ ] Add onEnter to submit forms
- [ ] In organization settings, for current user, ability to change the api key
- [ ] In API keys page, a special modal for generating a signature (for developer convinence such as when they want a temp auth token or call the `/api-keys/create` endpoint)
- [ ] User initiated superswap_userid as a form of account "recovery" when they've lost/compromised their seed phrase. This should be added as a permission with grantee being a user/group etc.

## Done

- [x] Make sure switch users will persist who the current user is, so that upon browser restart its seamless to get user back in
- [x] Setup multi-organizations
- [x] Setup default profile per organization, UX sugar (can just be most recent)
- [x] Setup API keys for organization <> profile with /organization/whoami
- [x] Factory deploy drive, connect to frontend
- [x] Contacts UI pages
- [x] Regenerate REST API docs & types with new routes, `/organization/whoami`, `/organization/superswap_user`, `/organization/redeem`
- [x] Ensure that offline cached requests work across multiple orgs & profiles
- [x] Consider how to build local read replicas of known state (authorized sub-state), in an offline manner --> solution is to use client generated uuid and build state representation in local indexdb ourselves
- [x] Hook up redux-offline with a long term ui state storage, maybe an indexdb local read replica or redux-cache when offline? its okay to call backend every page load, but when offline need to get the data from somewhere. maybe we get rid of explicit persist cache on disks-et-al and only cache offline. when no internet we query direct from localstorage? thus redux offline only handles mutations (create, update, delete) while queries (get, list) are handled by custom logic searching indexdb. --> seems more sensible to seperate out logic for mutations vs queries
- [x] Contacts crud routes (with redux-offline)
- [x] fix add webhooks component
- [x] Polish all tables to match groups behavior (got rid of OPEN button and clicking name goes into tab directly no untab, clicking rest of row tabs/untabs without navigating to it)
- [x] Fix uploading to indexdb which saves raw chunks but doesnt save into dexie files hashtable (we might want to undo our indexdb.adapter which replced uploadid with fileid, possibly incorrect)
- [x] Fix upload process with inherent folder direvtory preservation (uploading folder should preserve directory)
- [x] Create a unified provider for handling uploads to different end destinations
- [x] Cleanup/refactor directory reducers & optimistic middleware to handle the diverse file uploading
- [x] Fix the lack of duplicate handling for files & folders
- [x] Implement actual file uploading & panel showing progress (from DriveUI too!)
- [x] Add FilePage UI
- [x] Implement magic link directory permission
- [x] Invite contact with redeem feature
- [x] Share folder & guests can upload properly
- [x] Implement password directory permission
- [x] Invite system with smooth onboarding & sharing (1-2 days)
- [x] Implement magic link groups
- [x] Patch free cloud filesharing to have the presigned s3 url in the share link via btoa encoding
