[@react.component]
let make = (~api: DApp.Api.t) => {
    <div id="enter-raffle">
        <input type_="range" id="entrySlider" min="0.01" max="0.1" step=0.01 />
        <div id="entryButon" 
            onClick={_ => DApp.Contract.enterRaffle(api, DomFunctions.getEntrySliderValue())}
        >
            {React.string("Enter raffle!")}
        </div>
    </div>
}