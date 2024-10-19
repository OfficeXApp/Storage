# OfficeX Drive

Deploy static webapp:

```sh
npm run build
firebase deploy --only hosting:drive-officex
```

Reinstall framework lib

```sh
npm uninstall @officexapp/framework && npm install @officexapp/framework@0.0.191
```
