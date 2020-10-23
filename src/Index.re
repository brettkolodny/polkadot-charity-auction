switch (ReactDOM.querySelector("#root")) {
| Some(root) => ReactDOM.render(<Counter />, root)
| None => ()
};