/* eslint max-len: 0 */
/* eslint no-unused-vars: 0 */
import "bootstrap/dist/css/bootstrap.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
import React from "react";
import ReactDOM from "react-dom";
import BootstrapTable from "react-bootstrap-table-next";
import Select from "react-select";
import { Button, Col, Row } from "react-bootstrap";
import filterFactory, {
  Comparator,
  customFilter,
  FILTER_TYPES
} from "react-bootstrap-table2-filter";

let refs = {};
let filteredData = [];

export default class StockTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: false,
      portalReady: false
    };
    this.portal = React.createRef();
  }

  componentDidMount(prevProps) {
    this.setState({ portalReady: true });
  }

  getCustomFilter = (onFilter, column, products) => {
    let ref = React.createRef();
    refs[column.dataField] = ref;
    let options = [...new Set(products.map((field) => field[column.dataField]))]
      .sort()
      .map((entry) => ({
        label: entry,
        value: entry
      }));

    return this.state.portalReady
      ? ReactDOM.createPortal(
          <Col style={{ zIndex: "100" }} onClick={(e) => e.stopPropagation()}>
            <Select
              ref={ref}
              placeholder={column.text}
              isClearable
              isMulti
              options={options}
              className="filter"
              onChange={(event) => onFilter(event.map((entry) => entry.value))}
            />
          </Col>,
          document.getElementById("filter-container")
        )
      : null;
  };

  renderDropDown = ({ options, currSizePerPage, onSizePerPageChange }) => {
    const customStyles = {
      menu: (provided, state) => ({
        ...provided,
        color: "#0d6efd"
      }),
      control: (provided, state) => ({
        ...provided,
        backgroundColor: "#0d6efd",
        color: "white"
      }),
      singleValue: (provided, state) => ({
        ...provided,
        color: "white"
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        color: "white",
        "&:hover": {
          color: "#bbbbbb"
        }
      }),
      indicatorSeparator: (provided, state) => ({
        ...provided,
        backgroundColor: "white"
      })
    };
    let size = currSizePerPage;
    let selectedSize = { label: size, value: size };
    return (
      <Row style={{ marginLeft: "5px" }}>
        <Col xs={4}>
          <Select
            isSearchable={false}
            value={selectedSize}
            styles={customStyles}
            onChange={(selected) => {
              onSizePerPageChange(selected.value);
              size = selected.value;
            }}
            theme={(theme) => ({
              ...theme,
              borderRadius: "5px",
              backgroundColor: "#0d6efd"
            })}
            options={[
              { label: 5, value: 5 },
              { label: 10, value: 10 },
              { label: 15, value: 15 }
            ]}
          />
        </Col>
        <Col
          xs={8}
          ref={this.portal}
          className="justify-content-center align-self-center"
        ></Col>
      </Row>
    );
  };

  render() {
    const rowEvents = {
      onClick: (e, row, index) => this.setState({ activeRow: row })
    };
    const pagination = paginationFactory({
      sizePerPage: 5,
      firstPageText: "First",
      lastPageText: "Last",
      showTotal: true,
      paginationTotalRenderer: (start, to, total) => {
        return this.state.portalReady
          ? ReactDOM.createPortal(
              <span>
                {start} to {to} of {total}
              </span>,
              this.portal.current
            )
          : null;
      },
      sizePerPageRenderer: this.renderDropDown
    });
    const rowStyle = (row) => {
      if (row === this.state.activeRow) {
        return {
          backgroundColor: "lightcyan",
          border: "solid 2px grey",
          color: "purple"
        };
      }
    };
    const columns = [
      {
        sort: true,
        dataField: "id",
        text: "Product ID"
      },
      {
        sort: true,
        dataField: "name",
        filter: customFilter({
          type: FILTER_TYPES.MULTISELECT
        }),
        filterRenderer: (onFilter, column) =>
          this.getCustomFilter(
            onFilter,
            column,
            filteredData.length ? filteredData : this.props.products
          ),
        text: "Product Name"
      },
      {
        sort: true,
        dataField: "company",
        filter: customFilter({
          type: FILTER_TYPES.MULTISELECT
        }),
        filterRenderer: (onFilter, column) =>
          this.getCustomFilter(
            onFilter,
            column,
            filteredData.length ? filteredData : this.props.products
          ),
        text: "Company"
      },
      {
        sort: true,
        dataField: "quantity",
        filter: customFilter({
          type: FILTER_TYPES.MULTISELECT,
          comparator: Comparator.EQ
        }),
        filterRenderer: (onFilter, column) =>
          this.getCustomFilter(
            onFilter,
            column,
            filteredData.length ? filteredData : this.props.products
          ),
        text: "Quantity"
      },
      {
        sort: true,
        dataField: "isInStock",
        filter: customFilter({
          type: FILTER_TYPES.MULTISELECT
        }),
        filterRenderer: (onFilter, column) =>
          this.getCustomFilter(
            onFilter,
            column,
            filteredData.length ? filteredData : this.props.products
          ),
        text: "In Stock"
      }
    ];

    const afterFilter = (newData, filter) => (filteredData = newData);

    return (
      <div>
        <Row style={{ margin: "5px" }}>
          <Col>
            <Button
              className="btn btn-default w-100 shadow-none"
              onClick={() => this.setState({ filter: !this.state.filter })}
            >
              Filter
            </Button>
          </Col>
          <Col sm={{ span: 4, offset: 4 }} className="align-self-center">
            <Button
              hidden={!this.state.filter}
              className="btn btn-info text-white w-100 shadow-none"
              onClick={() => {
                for (let key in refs) {
                  refs[key].current.clearValue();
                }
              }}
            >
              Clear Filter
            </Button>
          </Col>
        </Row>
        <legend />

        <Row hidden={!this.state.filter} id="filter-container"></Row>
        <legend />
        <BootstrapTable
          keyField="id"
          columns={columns}
          data={this.props.products}
          rowEvents={rowEvents}
          rowStyle={rowStyle}
          pagination={pagination}
          filter={filterFactory({ afterFilter })}
        />
      </div>
    );
  }
}
