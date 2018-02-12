/**
 *
 * Cell - renders td component
 *
 */

import React from "react";
import DataCell from "./DataCell";

class Cell extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <td className="cell">
        <DataCell {...this.props} />
      </td>
    );
  }
}

Cell.propTypes = {};

export default Cell;
