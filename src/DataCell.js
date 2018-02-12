/**
 *
 * DataCell - renders either Input control or Div based on selected cell
 *
 */

import React from "react";
import PropTypes from "prop-types";

class DataCell extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.onFocusHandler = this.onFocusHandler.bind(this);
    this.onBlurHandler = this.onBlurHandler.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.state = {
      currentCell: this.props.value
    };
  }

  // Trigger on Chnage call back if some different cell is selected
  componentWillReceiveProps(nextProps) {
    if (this.props.selectedCell && !nextProps.selectedCell) {
      if (this.ele) {
        this.props.onChangeValue({
          key: this.props.value.key,
          value: this.props.value.value,
          expression: this.ele.value
        });
      }
    }
    this.setState({
      currentCell: nextProps.value
    });
  }
  // Call OnSelectCell Callback on Focus
  onFocusHandler() {
    if (this.props.onSelectCell) {
      this.props.onSelectCell(this.props.value);
    }
    if (this.ele) {
      this.ele.focus();
    }
  }
  // Change State and Trigger select cell (required for function bar)
  onChangeInput(e) {
    this.setState({
      currentCell: {
        key: this.props.value.key,
        value: this.props.value.value,
        expression: e.target.value
      }
    });
    this.props.onSelectCell({
      key: this.props.value.key,
      value: this.props.value.value,
      expression: e.target.value
    });
  }

  // Trigger OnChangeValue on Blur
  onBlurHandler(e) {
    this.props.onChangeValue({
      key: this.props.value.key,
      value: this.props.value.value,
      expression: e.target.value
    });
  }
  render() {
    const readOnly = this.props.value.readOnly;
    return (
      <div className="dataCell">
        {this.props.selectedCell && !readOnly ? (
          <input
            className="input"
            ref={ele => {
              this.ele = ele;
            }}
            type="text"
            value={this.props.selectedExpression}
            onBlur={this.onBlurHandler}
            onChange={this.onChangeInput}
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            className={`viewer ${readOnly && "readOnly"}`}
            readOnly={readOnly}
            onMouseDown={this.onFocusHandler}
          >
            {this.state.currentCell.value}
          </div>
        )}
      </div>
    );
  }
}

DataCell.propTypes = {
  value: PropTypes.shape(),
  onChangeValue: PropTypes.func,
  selectedCell: PropTypes.bool,
  onSelectCell: PropTypes.func,
  selectedExpression: PropTypes.string
};

export default DataCell;
