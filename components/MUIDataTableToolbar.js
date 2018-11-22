import Typography from "@material-ui/core/Typography"
import Toolbar from "@material-ui/core/Toolbar"
import Tooltip from "@material-ui/core/Tooltip"
import IconButton from "@material-ui/core/IconButton"
import { MUIPopover, MUIPopoverTarget, MUIPopoverContent } from "./MUIPopover"
import MUIDataTableFilter from "./MUIDataTableFilter"
import MUIDataTableViewCol from "./MUIDataTableViewCol"
import MUIDataTableSearch from "./MUIDataTableSearch"
import SearchIcon from "@material-ui/icons/Search"
import DownloadIcon from "@material-ui/icons/CloudDownload"
import PrintIcon from "@material-ui/icons/Print"
import ViewColumnIcon from "@material-ui/icons/ViewColumn"
import FilterIcon from "@material-ui/icons/FilterList"
import merge from "lodash.merge"
import ReactToPrint from "react-to-print"
import { withStyles } from "@material-ui/core/styles"
import textLabels from "../data/textLabels"

const toolbarStyles = {
  root: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  left: {
    flex: "0 0 auto",
  },
  spacer: {
    flex: "1 1 100%",
  },
  actions: {
    display: "flex",
    flexDirection: "row",
    flex: "0 0 auto",
    textAlign: "right",
  },
  titleRoot: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  titleText: { minWidth: 250 },
  subheadingText: { paddingLeft: 20, color: "gray", minWidth: 150 },
  icon: {
    "&:hover": {
      color: "#307BB0",
    },
  },
  iconActive: {
    color: "#307BB0",
  },
  searchIcon: {
    display: "inline-flex",
    marginTop: "10px",
    marginRight: "8px",
  },
}

class MUIDataTableToolbar extends React.Component {
  state = {
    iconActive: null,
    openSearch: false,
  }

  handleCSVDownload = () => {
    const { data, columns } = this.props

    const CSVHead =
      columns
        .reduce((soFar, column) => soFar + '"' + column.name + '",', "")
        .slice(0, -1) + "\r\n"
    const CSVBody = data
      .reduce((soFar, row) => soFar + '"' + row.data.join('","') + '"\r\n', [])
      .trim()

    /* taken from react-csv */
    const csv = `${CSVHead}${CSVBody}`
    const blob = new Blob([csv], { type: "text/csv" })
    const dataURI = `data:text/csv;charset=utf-8,${csv}`

    const URL = window.URL || window.webkitURL
    const downloadURI =
      typeof URL.createObjectURL === "undefined"
        ? dataURI
        : URL.createObjectURL(blob)

    let link = document.createElement("a")
    link.setAttribute("href", downloadURI)
    link.setAttribute("download", "tableDownload.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  setActiveIcon = (iconName) => {
    this.setState(() => ({
      iconActive: iconName,
      openSearch: iconName === "search" ? true : false,
    }))
  }

  getActiveIcon = (styles, iconName) => {
    return this.state.iconActive !== iconName ? styles.icon : styles.iconActive
  }

  handleHideSearch = () => {
    this.props.onSearchTextChange("")

    this.setState(() => ({
      iconActive: null,
      openSearch: false,
    }))
  }

  render() {
    const {
      data,
      columns,
      filterData,
      filterList,
      onFilterUpdate,
      onResetFilters,
      searchText,
      onSearchTextChange,
      onToggleViewColumn,
      title,
      tableRef,
      classes,
    } = this.props

    const {
      search,
      downloadCsv,
      print,
      viewColumns,
      filterTable,
    } = textLabels.toolbar

    const { openSearch } = this.state

    const showSearch = true
    const showDownloadCsv = false
    const showPrint = false
    const showFilterColumns = false
    const showFilterRows = true

    return (
      <Toolbar
        className={classes.root}
        role={"toolbar"}
        aria-label={"Table Toolbar"}
      >
        {/* On left, either show: SearchBar or Table Title */}
        {openSearch === true ? (
          <MUIDataTableSearch
            searchText={searchText}
            onSearchTextChange={onSearchTextChange}
            onHide={this.handleHideSearch}
          />
        ) : (
          <div className={classes.left}>
            <div className={classes.titleRoot} aria-hidden={"true"}>
              <Typography variant="title" className={classes.titleText}>
                {textLabels.title}
              </Typography>
              <Typography
                variant="subheading"
                className={classes.subheadingText}
              >
                {textLabels.subheadingText}
              </Typography>
            </div>
          </div>
        )}

        <div className={classes.spacer} />

        {/* On right, show: Toolbar Actions */}
        <div className={classes.actions}>
          {showSearch ? (
            <IconButton
              aria-label={search}
              buttonRef={(el) => (this.searchButton = el)}
              classes={{
                root: this.getActiveIcon(classes, "search"),
              }}
              onClick={this.setActiveIcon.bind(null, "search")}
            >
              <SearchIcon />
            </IconButton>
          ) : (
            false
          )}

          {showDownloadCsv ? (
            <Tooltip title={downloadCsv}>
              <IconButton
                aria-label={downloadCsv}
                classes={{ root: classes.icon }}
                onClick={this.handleCSVDownload}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          ) : (
            false
          )}
          {showPrint ? (
            <Tooltip title={print}>
              <span>
                <ReactToPrint
                  trigger={() => (
                    <IconButton
                      aria-label={print}
                      classes={{ root: classes.icon }}
                    >
                      <PrintIcon />
                    </IconButton>
                  )}
                  content={() => this.props.tableRef()}
                />
              </span>
            </Tooltip>
          ) : (
            false
          )}
          {showFilterColumns ? (
            <MUIPopover
              refExit={this.setActiveIcon.bind(null)}
              container={tableRef}
            >
              <MUIPopoverTarget>
                <IconButton
                  aria-label={viewColumns}
                  classes={{
                    root: this.getActiveIcon(classes, "viewcolumns"),
                  }}
                  onClick={this.setActiveIcon.bind(null, "viewcolumns")}
                >
                  <Tooltip title={viewColumns}>
                    <ViewColumnIcon />
                  </Tooltip>
                </IconButton>
              </MUIPopoverTarget>
              <MUIPopoverContent>
                <MUIDataTableViewCol
                  data={data}
                  columns={columns}
                  onColumnUpdate={onToggleViewColumn}
                />
              </MUIPopoverContent>
            </MUIPopover>
          ) : (
            false
          )}
          {showFilterRows ? (
            <MUIPopover
              refExit={this.setActiveIcon.bind(null)}
              container={tableRef}
            >
              <MUIPopoverTarget>
                <IconButton
                  aria-label={filterTable}
                  classes={{
                    root: this.getActiveIcon(classes, "filter"),
                  }}
                  onClick={this.setActiveIcon.bind(null, "filter")}
                >
                  <Tooltip title={filterTable}>
                    <FilterIcon />
                  </Tooltip>
                </IconButton>
              </MUIPopoverTarget>
              <MUIPopoverContent>
                <MUIDataTableFilter
                  columns={columns}
                  filterList={filterList}
                  filterData={filterData}
                  onFilterUpdate={onFilterUpdate}
                  onFilterReset={onResetFilters}
                />
              </MUIPopoverContent>
            </MUIPopover>
          ) : (
            false
          )}
        </div>
      </Toolbar>
    )
  }
}

export default withStyles(toolbarStyles)(MUIDataTableToolbar)
