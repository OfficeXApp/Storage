# Optimistic Offline

## Development Notes

Look at the directory `CREATE_FOLDER` flow in redux:

- `src/redux-offline/directory/directory.actions.ts` --> listDirectoryKey handles optimistic re-rendering of listDirectory, while also using ?refresh=uuidv4. and isOfflineDrive will tell the optimistic middleware to not arrive in reducer
- `src/redux-offline/directory/directory.optimistic.ts` --> the optimistic middleware exits early if isOfflineDrive, at code line `if (action.meta?.isOfflineDrive) { return }`.

## Next Steps

- [ ] Implement create folder and delete folder flow
