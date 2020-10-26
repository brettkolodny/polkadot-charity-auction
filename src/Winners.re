[@react.component]
let make = (~api: DApp.Api.t) => {
    let (winners: option(array(string)), setWinners) = React.useState(() => None);

    React.useEffect1(() => {
        let _ = DApp.Contract.getWinnersSubscription(api, w => setWinners(_ => Some(w)));

        None;
    }, [||]);

    switch (winners) {
    | Some([|winner1, winner2|]) => {
        <div id="winners">{React.string(winner1 ++ ", " ++ winner2)}</div>
    }
    | _ => <div id="winners">{React.string("Could not retrieve winners")}</div>
    }
};