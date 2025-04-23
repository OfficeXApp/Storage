export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  return IDL.Service({
    'create_drive' : IDL.Func([IDL.Text], [Result], []),
    'get_canister_balance' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_drive_by_index' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
    'get_total_drives' : IDL.Func([], [IDL.Nat64], ['query']),
    'get_user_drive' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
