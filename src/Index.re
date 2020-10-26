switch (ReactDOM.querySelector("#root")) {
| Some(root) => ReactDOM.render(<Raffle />, root)
| None => ()
};