[@bs.val] external setTimeout: ('a => 'b, int) => unit = "setTimeout";

[@react.component]
let make = (~api: DApp.Api.t) => {
    let (countdown: option(int), setCountdown) = React.useState(() => None);

    React.useEffect1(() => {
        switch (countdown) {
        | Some(v) => {
            if (v > 0) {
                setTimeout(() => setCountdown(_ => Some(v - 1)), 1000);
                ();
            } else {
                ();
            }
        }
        | None => ()
        };
        
        None;
    }, [|countdown|]);

    React.useEffect1(() => {
        let _ = DApp.Contract.getDrawCountdownSubscription(api, dc => {
            switch (countdown) {
            | None => {
                switch (Js.Nullable.toOption(dc)) {
                | Some(v) => setCountdown(_ => Some(v));
                | None => ();
                };
            }
            | _ => ()
            };
        });

        Js.log(countdown);

        None;
    }, [||]);
    
    switch (countdown) {
    | Some(cd) => {
        if (cd > 0) {
            <div id="countdown">{React.string("Draw in " ++ string_of_int(cd) ++ " seconds")}</div>
        } else {
            <div id="draw-button" onClick={_ => DApp.Contract.draw(api)}>{React.string("Draw now!")}</div>
        }
    }
    | None => <div id="countdown"></div>
    };
}