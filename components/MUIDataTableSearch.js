import Grow from "@material-ui/core/Grow"
import TextField from "@material-ui/core/TextField"
import SearchIcon from "@material-ui/icons/Search"
import IconButton from "@material-ui/core/IconButton"
import ClearIcon from "@material-ui/icons/Clear"
import { withStyles } from "@material-ui/core/styles"
import textLabels from "../data/textLabels"

const searchStyles = {
  main: {
    display: "flex",
    flex: "1 0 auto",
  },
  searchIcon: {
    marginTop: "10px",
    marginRight: "8px",
  },
  searchText: {
    flex: "0.8 0",
    minWidth: 600,
  },
  clearIcon: {
    "&:hover": {
      color: "#FF0000",
    },
  },
}

class MUIDataTableSearch extends React.Component {
  handleSearchTextChange = (event) =>
    this.props.onSearchTextChange(event.target.value)

  componentDidMount = () =>
    document.addEventListener("keydown", this.onKeyDown, false)

  componentWillUnmount = () =>
    document.removeEventListener("keydown", this.onKeyDown, false)

  onKeyDown = (event) => {
    if (event.keyCode === 27) {
      this.props.onHide()
    }
  }

  render() {
    const { searchText, onHide, classes } = this.props

    return (
      <Grow appear in={true} timeout={300}>
        <div className={classes.main} ref={(el) => (this.rootRef = el)}>
          <SearchIcon className={classes.searchIcon} />
          <TextField
            className={classes.searchText}
            value={searchText}
            onChange={this.handleSearchTextChange}
            autoFocus={true}
            InputProps={{
              "aria-label": textLabels.toolbar.search,
            }}
            fullWidth={true}
          />
          <IconButton className={classes.clearIcon} onClick={onHide}>
            <ClearIcon />
          </IconButton>
        </div>
      </Grow>
    )
  }
}

export default withStyles(searchStyles)(MUIDataTableSearch)
