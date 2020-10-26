[@react.component]
let make = (~api: DApp.Api.t) => {
    let (entries: option(string), setEntries) = React.useState(() => None);

    React.useEffect1(() => {
        let _ = DApp.Contract.numEntriesSubscription(api, e => setEntries(_ => Some(e)))
        None;
    },
    [||]);

    switch (entries) {
    | Some(ne) => {
        if (int_of_string(ne) < 5) {
            <div id="num-entires">{React.string(ne ++ "/5 Entries")}</div>
        } else {
            <div id="num-entries">{React.string(ne ++ " Entries")}</div>
        }
    }
    | None => <div id="num-entries">{React.string("Could not get entries")}</div>
    };     
};