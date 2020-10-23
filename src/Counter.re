[@react.component]
let make = () => {
    let (count, setCount) = React.useState(_ => 0);
    <div>
        <h1>{ReasonReact.string(string_of_int(count))}</h1>
        <button onClick={_ => setCount(_ => count + 1)}>{ReasonReact.string("Press me!")}</button>
        <button onClick={_ => setCount(_ => 0)}>{ReasonReact.string("Reset")}</button>
    </div>
};