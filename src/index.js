import React from "react";
import { render } from "react-dom";
import SpreadSheet from "./SpreadSheet";

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center"
};

const App = () => (
  <div style={styles}>
    <SpreadSheet row={10} column={4} />
  </div>
);

render(<App />, document.getElementById("root"));
