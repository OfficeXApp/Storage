# Developer To Do

## Overview

The large sprints of work are:

3. Cleaning & testing all the crud routes together (2-3 days)

1. Directory navigation & interaction (1-2 days)
1. Invite system with smooth onboarding & sharing (1-2 days)
1. Offline JS functionality replica (1-2 days)
1. UI polish before prod (1-2 days)

## Todo

- [🔵] Figure out a unified tag framework
- [🔵] Implement permissions on frontend (redux, reuseable ui pickers, crud)
- [🔵] Blitzkreig the rest of the crud routes?
- [🔵] Blitzkreig the rest of the crud UI?
- [🔵] Groups & Group Invite creation routes (with redux-offline)
- [ ] Handle folder copy logic where subfiles wont have a known ID, so the type FolderFEO.sync_warning = string should help us warn the user
- [ ] Magic login link with redeem placeholders (both for contacts themselves, and via group invite, also FactorySpawnOrgResponseData). replace password login scheme string, with a btoa password (before: "DriveID_abc123:password123@https://endpoint.com", after: RHJpdmVJRF9...dC5jb20) url safe ?password=btoa
- [ ] Polish all tables to match groups behavior (got rid of OPEN button and clicking name goes into tab directly no untab, clicking rest of row tabs/untabs without navigating to it)
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
