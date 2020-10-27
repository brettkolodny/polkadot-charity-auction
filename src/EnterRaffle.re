[@react.component]
let make = (~api: DApp.Api.t) => {
    let (sliderValue, setSliderValue) = React.useState(() => "0.1");

    <div id="enter-raffle">
        <div id="token-amount">{React.string(sliderValue ++ " tokens")}</div>
        <input 
            type_="range" 
            id="entry-slider" 
            min="0.01" 
            max="0.1" 
            step=0.01 
            value=sliderValue
            onChange={_ => setSliderValue(_ => DomFunctions.getEntrySliderValue() -> string_of_int)}
        />
        <div id="entry-button" 
            onClick={_ => DApp.Contract.enterRaffle(api, DomFunctions.getEntrySliderValue())}
        >
            {React.string("Enter raffle!")}
        </div>
    </div>
}