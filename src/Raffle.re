[@react.component]
let make = () => {
    let (api: option(DApp.Api.t), setApi) = React.useState(() => None);

    let _ = React.useEffect1(() => {
        let _ = DApp.Api.connect()
        |> Js.Promise.then_(apiValue => {
            setApi(_ => Some(apiValue));
            Js.Promise.resolve(Some(apiValue));
        })
        |> Js.Promise.catch(err => {
            Js.log(err);
            Js.Promise.resolve(None);
        });
        None;
    }, [||]);

    switch (api) {
    | Some(a) => {
        <div id="raffle">
            <div id="title">
                {React.string("Charity Raffle!")}
            </div>

            <Winners api=a />
            
            <Countdown api=a />

            <Entries api=a />

            <EnterRaffle api=a />
        </div>
    }
    | None => <div></div>
    };
};