import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import PropTypes from "prop-types";
import { cloneDeep } from "lodash";

import { MultiGrid, AutoSizer } from "react-virtualized";

import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

import MUIDataTableToolbar from "./MUIDataTableToolbar";
import MUIDataTableToolbarSelect from "./MUIDataTableToolbarSelect";
import MUIDataTableFilterList from "./MUIDataTableFilterList";
import CellContents from "../components/CellContents";
import PaperScrollDialog from "../components/PaperScrollDialog";

import columnData from "../data/BedBugColumnData";
import productData from "../data/BedBugProductData";
import textLabels from "../data/textLabels";

const DEBUG = false;

const tableStyles = theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    height: "100vh"
  },
  toolbar: {
    flex: "0 0 auto"
  },
  tableContainer: {
    flex: "1 1 auto"
  },
  table: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif"
  },
  sortIcon: {
    height: 16,
    width: 16,
    marginLeft: 8
  },
  tableCellContainer: {
    display: "flex",
    flexDirection: "row"
  },
  cell: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 0
  },
  headCell: {
    fontSize: "0.75rem",
    fontWeight: "500",
    borderBottom: "1px solid gray",
    borderRight: "1px solid rgba(224, 224, 224, 1)"
  },
  fixedColumnCell: {
    fontSize: "0.8125rem",
    fontWeight: "500",
    borderRight: "1px solid gray",
    alignItems: "center",
    textAlign: "center"
  },
  bodyCell: {
    borderRight: "1px solid rgba(224, 224, 224, 1)"
  },
  cellContents: {},
  sortableHeadCellContents: {
    cursor: "pointer"
  },
  bodyCellContents: {
    fontSize: "0.8125rem",
    fontWeight: "400"
  },
  cellSelected: {
    backgroundColor: theme.palette.grey[100]
  },
  cellHovered: {
    backgroundColor: theme.palette.grey[200]
  },
  dialogCell: {
    border: "0px solid black"
  },
  footer: {
    display: "flex",
    justifyContent: "center",
    flex: "0 0 auto",
    backgroundColor: "gray"
  },
  footerContent: {}
});

class BedBugDataTable extends React.Component {
  constructor() {
    super();

    this.tableRef = false;

    const initialDisplayColumns = columnData.reduce(
      (result, column, columnIndex) => {
        if (column.visible) {
          result.push({
            id: column.id,
            name: column.textLabel,
            type: column.type,
            columnIndex: columnIndex,
            displayIndex: result.length
          });
        }
        return result;
      },
      []
    );

    const initialDisplayData = productData.map(product =>
      initialDisplayColumns.map(column => product[column.id])
    );

    this.initialFilterData = columnData.map(column =>
      productData.reduce((columnResult, productRow) => {
        const productValue = productRow[column.id];
        switch (column.type) {
          case "dictionary":
            for (const key in productValue) {
              if (columnResult.indexOf(key) === -1) {
                columnResult.push(key);
              }
            }
            break;
          case "list":
            for (const index in productValue) {
              if (columnResult.indexOf(productValue[index]) === -1) {
                columnResult.push(productValue[index]);
              }
            }
            break;
          case "list_custom1":
            // The column otherReferencedProductAttributes is not filterable
            break;
          case "string":
            if (columnResult.indexOf(productValue) === -1) {
              columnResult.push(productValue);
            }
            break;
          default:
            if (DEBUG) {
              console.log(
                "WARNING: column.type:",
                column.type,
                "Expected 'string', 'list', or 'dictionary'.",
                "Fix this by editing the column definition in ./data/BedBugMetaData.json"
              );
            }
            break;
        }

        return columnResult.sort();
      }, [])
    );

    this.state = {
      // list of displayed columns - properties: {id, name, columnIndex, displayIndex}
      displayColumns: initialDisplayColumns,
      // 2D array containing data to display
      displayData: initialDisplayData,
      // table index of the hovered row
      hoveredRow: null,
      // table indices of the selected rows
      selectedRows: {
        data: [],
        lookup: {}
      },
      // one array of unique column values per row in column data
      filterData: cloneDeep(this.initialFilterData),
      // one element per column in columnData
      filterList: columnData.map(() => []),
      // user input from search field
      searchText: "",
      // index of column sorted by, default: productData order
      sortColumnIndex: null,
      // sortDirection: "asc" or "desc"
      sortDirection: "asc",
      // used by popover dialog component
      cellDialog: {
        open: false,
        row: null,
        column: null
      },
      // true on first render, false otherwise
      initialUpdate: true
    };
    if (DEBUG) {
      console.log("columnData: ", columnData);
      console.log("productData: ", productData);
    }

    /* save the style set by react-virtualized's table CellRenderer so we can
         reuse the style in our dialog */
    this.cellStyle = null;
  }

  /* Call this when table data is updated, but number of rows stays the same. */
  forceTableRefresh() {
    this.multiGridRef.forceUpdateGrids();
  }

  /* Call this when number of rows might change (e.g. on sort/filter update). */
  updateDisplayData = () => {
    // recalculate displayData from scratch
    this.setState(prevState => {
      var displayData = productData.reduce((result, product) => {
        var filteredOut = false;
        const productRow = prevState.displayColumns.reduce(
          (rowResult, column, columnIndex) => {
            if (filteredOut) return [];

            const cellData = product[column.id];
            const filters = prevState.filterList[columnIndex];

            if (!this.meetsFilterCriteria(cellData, column.type, filters))
              filteredOut = true;

            rowResult.push(product[column.id]);
            return rowResult;
          },
          []
        );
        if (!filteredOut) result.push(productRow);
        return result;
      }, []);

      const { sortColumnIndex, sortDirection } = prevState;
      if (sortColumnIndex !== null) {
        displayData.sort(this.columnSorter(prevState.sortColumnIndex));
        if (prevState.sortDirection === "asc") {
          displayData.reverse();
        }
      }

      return { displayData: displayData, initialUpdate: false };
    });

    // refresh display with new state
    this.forceTableRefresh();
  };

  columnSorter = sortByIndex => {
    return function(rowA, rowB) {
      if (rowA[sortByIndex] === rowB[sortByIndex]) {
        return 0;
      } else {
        return rowA[sortByIndex] < rowB[sortByIndex] ? -1 : 1;
      }
    };
  };

  meetsFilterCriteria = (cellData, columnType, filters) => {
    // if no filters are active:
    if (filters.length === 0) return true;

    var meetsOneFilter = false;
    switch (columnType) {
      case "dictionary":
        for (const filterIndex in filters) {
          if (Object.keys(cellData).indexOf(filters[filterIndex]) >= 0) {
            meetsOneFilter = true;
          }
        }
        break;
      case "list":
        for (const filterIndex in filters) {
          if (cellData.indexOf(filters[filterIndex]) >= 0) {
            meetsOneFilter = true;
          }
        }
        break;
      case "list_custom1":
        for (const filterIndex in filters) {
          if (cellData.indexOf(filters[filterIndex]) >= 0) {
            meetsOneFilter = true;
          }
        }
        break;
      case "string":
        for (const filterIndex in filters) {
          if (cellData == filters[filterIndex]) {
            meetsOneFilter = true;
          }
        }
        break;
    }
    return meetsOneFilter;
  };

  cellRenderer = ({ rowIndex, columnIndex, key, style, isInDialog }) => {
    const { classes } = this.props;
    const {
      hoveredRow,
      selectedRows,
      displayData,
      sortColumnIndex,
      sortDirection
    } = this.state;

    if (isInDialog) {
      if (!rowIndex || !columnIndex) {
        return false;
      }
    }

    const column = columnData[columnIndex];

    const isHeader = rowIndex === 0;
    const isSortableHeader = isHeader && column.sortable;
    const isStickyColumn = columnIndex === 0;
    const isBodyCell = !isHeader && !isStickyColumn;
    const isHovered = rowIndex > 0 && rowIndex && !isInDialog === hoveredRow;
    const isSelected = rowIndex in selectedRows.lookup;

    const searchText = isHeader ? "" : this.state.searchText;
    var contents = isHeader
      ? column.textLabel
      : displayData[rowIndex - 1][columnIndex];

    if (!contents && contents !== "") {
      if (DEBUG) {
        console.log(
          "ERROR: no contents for ( rowIndex , columnIndex ) --> (",
          rowIndex,
          ",",
          columnIndex,
          ")"
        );
      }
      contents = rowIndex - 1 + ", " + columnIndex;
    }

    const handleCellClick = (rowIndex, columnIndex) => {
      if (rowIndex === 0 && columnData[columnIndex].sortable) {
        this.handleToggleSortColumn(columnIndex);
      }
      // TODO: change if to check cell state and only expand cell when it has been truncated
      if (rowIndex > 0 && columnIndex > 0) {
        this.handleClickOpenDialog(rowIndex, columnIndex);
      }
      return false;
    };

    const cellClassName = classNames(classes.cell, {
      [classes.headCell]: isHeader,
      [classes.sortableHeadCell]: isSortableHeader,
      [classes.fixedColumnCell]: isStickyColumn,
      [classes.bodyCell]: isBodyCell,
      [classes.cellHovered]: isHovered,
      [classes.cellSelected]: isSelected,
      [classes.dialogCell]: isInDialog // last in list to override border assignment
    });

    const cellContentsClassName = classNames(classes.cellContents, {
      [classes.headCellContents]: isHeader,
      [classes.bodyCellContents]: isBodyCell,
      [classes.sortableHeadCellContents]: isSortableHeader
    });

    //TODO: add mark to truncated cells (problem: how to detect elipsized cells?)
    return (
      <TableCell
        component="div"
        className={cellClassName}
        key={key}
        style={style}
        onMouseEnter={() => {
          this.setState({ hoveredRow: rowIndex });
          this.forceTableRefresh();
        }}
        onMouseLeave={() => {
          this.setState({ hoveredRow: null });
          this.forceTableRefresh();
        }}
        onClick={handleCellClick.bind(null, rowIndex, columnIndex)}
      >
        <span className={classes.tableCellContainer}>
          {isHeader && columnIndex == sortColumnIndex ? (
            <React.Fragment>
              {sortDirection == "desc" ? (
                <ArrowDownwardIcon className={classes.sortIcon} />
              ) : (
                <ArrowUpwardIcon className={classes.sortIcon} />
              )}
            </React.Fragment>
          ) : (
            false
          )}
          <CellContents
            className={cellContentsClassName}
            contents={contents}
            dataAppend={isHeader ? "" : column.dataAppend}
            contentsType={isHeader ? "string" : column.type}
            width={isInDialog ? 400 : column.width}
            searchText={searchText}
            wrap={isInDialog || isHeader || isStickyColumn}
          />
        </span>
      </TableCell>
    );
  };

  handleFilterUpdate = (columnIndex, filterValue, filterType) => {
    // update FilterList
    this.setState(prevState => {
      var filterList = cloneDeep(prevState.filterList);
      filterList[columnIndex] = filterValue === "" ? [] : filterValue.sort();
      return { filterList: filterList };
    });
    this.updateDisplayData();
  };

  handleToggleSortColumn = columnIndex => {
    this.setState(prevState => {
      var direction =
        prevState.sortColumnIndex === columnIndex &&
        prevState.sortDirection === "desc"
          ? "asc"
          : "desc";
      return {
        sortColumnIndex: columnIndex,
        sortDirection: direction
      };
    });
    this.updateDisplayData();
  };

  handleResetFilters = () => {
    this.setState(prevState => ({
      filterData: cloneDeep(this.initialFilterData),
      filterList: columnData.map(() => [])
    }));

    this.updateDisplayData();
  };

  handleSearchTextChange = searchText => {
    this.setState({
      searchText: searchText
    });
    this.forceTableRefresh();
  };

  handleClickOpenDialog = (rowIndex, columnIndex) => {
    this.setState({
      cellDialog: {
        open: true,
        row: rowIndex,
        column: columnIndex
      }
    });
  };

  handleCloseDialog = () => {
    this.setState({
      cellDialog: {
        open: false,
        row: null,
        column: null
      }
    });
  };

  /* NOTE: not tested */
  /*
  handleToggleViewColumn = index => {
    this.setState(prevState => {
      var columns = prevState.displayColumns;
      columns.splice(index, 1);
      return { displayColumns: columns };
    });
    this.forceTableRefresh();
  };
  */

  getColumnWidth = index => {
    return columnData[index].width;
  };

  getRowHeight = index => {
    // 17=font height, 5 text rows, +10 for breathing room
    return index === 0 ? 40 : 17 * 5 + 10;
  };

  render() {
    if (!productData || !productData.length) {
      console.log("Warning: product data not found.");
      return false;
    }

    if (DEBUG) {
      console.log("State on BedBugDataTable render: ", this.state);
    }
    const { classes } = this.props;

    const {
      displayColumns,
      displayData,
      filterData,
      filterList,
      selectedRows,
      searchText,
      hoveredRow,
      cellDialog
    } = this.state;

    const dataTableToolbar = (
      <div className={classes.toolbar}>
        <MUIDataTableToolbar
          columns={columnData}
          data={productData}
          searchText={searchText}
          filterData={filterData}
          filterList={filterList}
          tableRef={() => this.tableContent}
          onFilterUpdate={this.handleFilterUpdate}
          onResetFilters={this.handleResetFilters}
          onSearchTextChange={this.handleSearchTextChange}
          onToggleViewColumn={this.handleToggleViewColumn}
        />
        <MUIDataTableFilterList
          columns={columnData}
          filterList={filterList}
          onFilterUpdate={this.handleFilterUpdate}
        />
      </div>
    );

    const displayRowCount = displayData.length;
    const width = 500;
    const containerHeight = 800;
    const multiGridHeight = 400;
    const dataTable = (
      <div className={classes.tableContainer}>
        <AutoSizer>
          {({ height, width }) => (
            <Table className={classes.table} component="div">
              <MultiGrid
                cellRenderer={this.cellRenderer}
                ref={el => (this.multiGridRef = el)}
                width={width}
                columnWidth={({ index }) => this.getColumnWidth(index)}
                columnCount={displayColumns.length}
                fixedColumnCount={1}
                height={height}
                rowHeight={({ index }) => this.getRowHeight(index)}
                rowCount={displayRowCount + 1}
                fixedRowCount={1}
                classNameTopLeftGrid={"topLeftGrid"}
                classNameTopRightGrid={"topRightGrid"}
                classNameBottomLeftGrid={"bottomLeftGrid"}
                classNameBottomRightGrid={"bottomRightGrid"}
              />
            </Table>
          )}
        </AutoSizer>
      </div>
    );

    const cellDialogColumn = columnData[cellDialog.columnIndex];
    const paperScrollDialog = (
      <PaperScrollDialog
        open={cellDialog.open}
        handleClickOpen={this.handleClickOpenDialog}
        handleClose={this.handleCloseDialog}
      >
        <Table className={classes.table} component="div">
          {this.cellRenderer({
            rowIndex: cellDialog.row,
            columnIndex: cellDialog.column,
            key: 0,
            style: this.cellStyle,
            isInDialog: true
          })}
        </Table>
      </PaperScrollDialog>
    );

    const footer = (
      <div className={classes.footer}>
        <div className={classes.footerContent}>
          <p>Todos</p>
          <ul>
            <li>add column tooltips to explain terms (?)</li>
            <li>add filters for otherReferencedProductAttributes column</li>
            <li>add reference links/downloads</li>
          </ul>
          <p>Made with: Next.js, Material-UI, react-virtualized</p>
          <p>
            Thanks to <a href="https://github.com/techniq/mui-table">techniq</a>{" "}
            and <a href="https://github.com/gregnb/mui-datatables">gregnb</a>{" "}
            for your excellent work on mui-table and mui-datatables.
          </p>
        </div>
      </div>
    );

    return (
      <div className={classes.root} ref={el => (this.tableContent = el)}>
        {dataTableToolbar}
        {dataTable}
        {paperScrollDialog}
        {false ? footer : false}
      </div>
    );
  }
}

export default withStyles(tableStyles)(BedBugDataTable);
