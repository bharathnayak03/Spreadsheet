/**
 *
 * SpreadSheet
 *
 */

import React from "react";
import PropTypes from "prop-types";
import { SUM, POWER, AVERAGE } from "./Math.util";
import "./main.css";
import Cell from "./Cell.js"; // eslint-disable-line import/extensions
import Row from "./Row.js"; // eslint-disable-line import/extensions

const DepGraph = require("dependency-graph").DepGraph;

class SpreadSheet extends React.PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.generateState();
    this.onCellValueChanged = this.onCellValueChanged.bind(this);
    this.onSelectCell = this.onSelectCell.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onBlurFunctionBar = this.onBlurFunctionBar.bind(this);
  }
  // Set Selected Cell
  onSelectCell(cell) {
    this.setState({
      selectedCell: cell
    });
  }
  // Changed Input required for Function bar
  onChangeInput(e) {
    this.onSelectCell({
      key: this.state.selectedCell.key,
      value: this.state.selectedCell.value,
      expression: e.target.value
    });
  }
  // Change value based on function bar change
  onBlurFunctionBar(e) {
    this.onCellValueChanged({
      key: this.state.selectedCell.key,
      value: this.state.selectedCell.value,
      expression: e.target.value
    });
  }
  // Only on the change of the cell value
  onCellValueChanged(newValue) {
    if (this.state.data[newValue.key].expression !== newValue.expression) {
      let data = Object.assign({}, this.state.data, {
        [newValue.key]: newValue
      });
      data = this.evaluateGrid(data);
      this.setState({
        data
      });
    }
  }
  // Getter for Cell Object
  getValue(data, key) {
    return data[key] ? data[key].value : key;
  }

  // Generate dependency graph - to evaluate multiple dependant expressions
  // Using dependency-graph module
  getDependency(value) {
    try {
      if (value != null && value.expression.charAt(0) === "=") {
        if (!this.graph.hasNode(value.key)) {
          this.graph.addNode(value.key);
        }
        const expression = value.expression;
        // Extract Params
        const args = /\(\s*([^)]+?)\s*\)/.exec(expression);
        const arr = args && args[1].split(",");
        const newArr = arr.map(item => {
          const range = item.split(":");
          if (range.length > 1) {
            const total = [];
            const key1 = range[0].match(/[a-zA-Z]+|[0-9]+/g);
            const key2 = range[1].match(/[a-zA-Z]+|[0-9]+/g);
            // Does not work for columns more than 26 (aa...) No time
            const m1 = key1[0];
            const n1 = key1[1];
            const m2 = key2[0];
            const n2 = key2[1];
            for (let i = 0; i <= Math.abs(n2 - n1); i += 1) {
              for (
                let j = 0;
                j <= Math.abs(m2.charCodeAt() - m1.charCodeAt());
                j += 1
              ) {
                const key =
                  String.fromCharCode(key1[0].charCodeAt() + j) +
                  (parseInt(key1[1], 10) + i);
                total.push(key);
              }
            }
            return [...total];
          }
          return range;
        });
        newArr.reduce((acc, cur) => acc.concat(cur), []).forEach(item => {
          if (!this.graph.hasNode(item)) {
            this.graph.addNode(item);
          }
          this.graph.addDependency(value.key, item);
        });
      } else if (!this.graph.hasNode(value.key)) {
        this.graph.addNode(value.key);
      }
    } catch (error) {
      console.log(error);
    }
  }
  // Evaluate grid in dependency graph order - error only for first cycle
  evaluateGrid(data) {
    this.graph = new DepGraph();
    for (const [key, value] of Object.entries(data)) {
      // eslint-disable-line no-restricted-syntax
      if (!value.readOnly) {
        this.getDependency(value);
      }
    }
    try {
      console.log(this.graph.overallOrder());
      this.graph.overallOrder().forEach(key => {
        if (data[key]) {
          Object.assign(data, {
            [key]: Object.assign({}, data[key], {
              value: this.compute(data, data[key])
            })
          });
        }
      });
      return data;
    } catch (error) {
      const errorArr = error.message
        .slice(error.message.indexOf("->") + 2)
        .trim()
        .split("->");
      errorArr.forEach(key => {
        Object.assign(data, {
          [key.trim()]: Object.assign({}, data[key.trim()], { value: "error" })
        });
      });
      return data;
    }
  }
  // Compute based on the function
  compute(data, value) {
    if (value != null && value.expression.charAt(0) === "=") {
      try {
        let params = this.generateExpression(
          data,
          value.expression.slice(1),
          value.key
        );
        params = params.filter(param => param && param !== "" && param);
        console.log(`${params[0]}(${params.slice(1)})`);
        const parameters = params
          .slice(1)
          .reduce((prev, curr) => prev.concat(curr))
          .filter(param => param && param !== "" && param);
        console.log(parameters);
        switch (params[0]) {
          case "SUM": {
            return SUM(...parameters);
          }
          case "POWER": {
            return POWER(...parameters);
          }
          case "AVERAGE": {
            return AVERAGE(...parameters);
          }
          default: {
            return "error";
          }
        }
      } catch (e) {
        return "error";
      }
    } else {
      return value.expression;
    }
  }
  // Get Parameters and Generate expression
  generateExpression(data, expression, currentKey) {
    const args = /\(\s*([^)]+?)\s*\)/.exec(expression);
    const arr = args && args[1].split(",");
    const index = args.index;
    const newArr = arr.map(item => {
      const range = item.split(":");
      if (range.length > 1) {
        const total = [];
        const key1 = range[0].match(/[a-zA-Z]+|[0-9]+/g);
        const key2 = range[1].match(/[a-zA-Z]+|[0-9]+/g);
        const m1 = key1[0];
        const n1 = key1[1];
        const m2 = key2[0];
        const n2 = key2[1];
        for (let i = 0; i <= Math.abs(n2 - n1); i += 1) {
          for (
            let j = 0;
            j <= Math.abs(m2.charCodeAt() - m1.charCodeAt());
            j += 1
          ) {
            const key =
              String.fromCharCode(key1[0].charCodeAt() + j) +
              (parseInt(key1[1], 10) + i);
            if (key === currentKey) {
              throw Error;
            }
            total.push(key);
          }
        }
        return [...total.map(x => this.getValue(data, x))];
      }
      if (range[0] === currentKey) {
        throw Error;
      }
      return range.map(x => this.getValue(data, x));
    });
    return [expression.slice(0, index), ...newArr];
  }
  // Generate the state data map respresting spreadsheet cells
  generateState() {
    const rows = this.props.row;
    const columns = this.props.column;
    const data = {};
    for (let i = 0; i <= rows; i += 1) {
      for (let j = 0; j <= columns; j += 1) {
        const key = this.generateKey(i, j);
        if (i === 0 || j === 0) {
          const val = i || this.generateHeaderValue(i, j);
          Object.assign(data, {
            [key]: { key, value: val, expression: "", readOnly: true }
          });
        } else {
          Object.assign(data, {
            [key]: { key, value: "", expression: "", readOnly: false }
          });
        }
      }
    }
    this.state = {
      data: Object.assign({}, data),
      selectedCell: {}
    };
  }
  // Geneate Key
  generateKey(row, column) {
    if (column === 0) {
      return `#${row}`;
    }
    let str = "";
    const n = parseInt(column / 26, 10);
    const charN = column % 26 || 26;
    for (let k = 0; k < n; k += 1) {
      str += String.fromCharCode(n + 96);
    }
    str += String.fromCharCode(charN + 96);

    return str + row;
  }
  // Generate Header Values
  generateHeaderValue(i, j) {
    if (j === 0) {
      return "#";
    }
    let str = "";
    const n = parseInt(j / 27, 10);
    const charN = j % 26 || 26;
    for (let k = 0; k < n; k += 1) {
      str += String.fromCharCode(n + 96);
    }
    str += String.fromCharCode(charN + 96);
    return str;
  }
  // Generate the Grid
  generateGrid() {
    const rows = this.props.row;
    const columns = this.props.column;
    return new Array(rows + 1)
      .fill({})
      .map((row, i) => (
        <Row key={this.generateKey(i, "r")}>
          {new Array(columns + 1)
            .fill({})
            .map((column, j) => (
              <Cell
                onChangeValue={this.onCellValueChanged}
                selectedExpression={this.state.selectedCell.expression}
                onSelectCell={this.onSelectCell}
                key={this.generateKey(i, j)}
                selectedCell={
                  this.state.selectedCell &&
                  this.state.selectedCell.key === this.generateKey(i, j)
                }
                value={this.state.data[this.generateKey(i, j)]}
              />
            ))}
        </Row>
      ));
  }
  render() {
    return (
      <div>
        <input
          type="text"
          className="functionBar"
          value={this.state.selectedCell.expression}
          onChange={this.onChangeInput}
          onBlur={this.onBlurFunctionBar}
        />
        <table className="spreadSheet">
          <tbody>{this.generateGrid()}</tbody>
        </table>
      </div>
    );
  }
}
SpreadSheet.propTypes = {
  row: PropTypes.number,
  column: PropTypes.number
};

export default SpreadSheet;
