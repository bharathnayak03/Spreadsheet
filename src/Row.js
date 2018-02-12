/**
 *
 * Row - Table row component
 *
 */

import React from "react";
import PropTypes from "prop-types";

class Row extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    return <tr className="row">{this.props.children}</tr>;
  }
}

Row.propTypes = {
  children: PropTypes.node
};

export default Row;
