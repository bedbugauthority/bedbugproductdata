import PropTypes from "prop-types"
import Chip from "@material-ui/core/Chip"
import { withStyles } from "@material-ui/core/styles"

const filterListStyles = {
  root: {
    display: "flex",
    justifyContent: "left",
    flexWrap: "wrap",
    margin: "0px 16px 0px 16px",
  },
  chip: {
    margin: "8px 8px 0px 0px",
  },
}

class MUIDataTableFilterList extends React.Component {
  static propTypes = {
    /** Data used to filter table against */
    filterList: PropTypes.array.isRequired,
    /** Callback to trigger filter update */
    onFilterUpdate: PropTypes.func,
    /** Extend the style applied to components */
    classes: PropTypes.object,
  }

  render() {
    const { classes, columns, filterList, onFilterUpdate } = this.props
    return (
      <div className={classes.root}>
        {filterList.map(
          (item, index) =>
            item.length === 0 ? (
              false
            ) : (
              <Chip
                className={classes.chip}
                label={columns[index].textLabel + ": " + item.toString()}
                key={index}
                onDelete={onFilterUpdate.bind(null, index, "", "multiselect")}
              />
            ),
        )}
      </div>
    )
  }
}

export default withStyles(filterListStyles)(MUIDataTableFilterList)
