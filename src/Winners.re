[@react.component]
let make = (~api: DApp.Api.t) => {
    let (winners: option(array(string)), setWinners) = React.useState(() => None);

    React.useEffect1(() => {
        let _ = DApp.Contract.getWinnersSubscription(api, w => setWinners(_ => Some(w)));
        None;
    }, [||]);

    switch (winners) {
    | Some([|winner1, winner2|]) => {
            {
                if (winner1 != "null" && winner2 != "null") {
                    Js.log(winner1);
                    Js.log(winner2);
                    <div id="winners">
                        {React.string("Winners: Raffle Over!")}
                        <div id="winners-identicons">
                            <Indenticon value=winner1 size=64 theme="polkadot" />
                            <Indenticon value=winner2 size=64 theme="polkadot" />
                        </div>
                    </div>
                } else if (winner1 != "null") {
                    Js.log("ran2");
                    <div id="winners">
                        {React.string("Winners:")}
                        <div id="winners-identicons">
                            <Indenticon value=winner1 size=64 theme="polkadot" />
                        </div>
                    </div>
                } else {
                    <div></div>
                };
            }
    }
    | _ => <div id="winners">{React.string("Could not retrieve winners")}</div>
    };
};