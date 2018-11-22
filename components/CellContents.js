import classNames from "classnames";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Link from "next/link";

const styles = theme => ({
  highlight: {
    backgroundColor: "yellow"
  },
  ul: {
    listStyleType: "none",
    padding: 0,
    margin: 0
  },
  textLine: {
    paddingRight: theme.spacing.unit,
    paddingLeft: theme.spacing.unit
  },
  textLineWrap: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
});

class CellContents extends React.Component {
  constructor(props) {
    super(props);
  }

  escapeRegExp = literal_string => {
    return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, "\\$&");
  };

  linkify = (ref_id, filetype = "pdf") => {
    //TODO: modify url to link to correct resource here
    const href = "/static/" + ref_id + "." + filetype;
    return (
      <Link href={href} target="_blank">
        <a>{ref_id}</a>
      </Link>
    );
  };

  highlighter = text => {
    if (this.props.searchText.length === 0) {
      return text;
    }

    const regex = new RegExp(
      "(" + this.escapeRegExp(this.props.searchText) + ")",
      "gim"
    );
    const blocks = text.split(regex);
    const contents = blocks.map((block, index) => {
      if (block.match(regex)) {
        return (
          <span key={index} className={this.props.classes.highlight}>
            {block}
          </span>
        );
      } else {
        return <span key={index}>{block}</span>;
      }
    });

    return <React.Fragment>{contents}</React.Fragment>;
  };

  parseArray = array => {
    if (!this.props.wrap && array.length > 5) {
      array = array.slice(0, 4);
      array.push("...");
    }

    const append = this.props.dataAppend ? this.props.dataAppend : "";

    return (
      <ul className={this.props.classes.ul}>
        {array.map((item, index) => {
          return (
            <li key={index}>
              <div
                className={classNames(this.props.classes.textLine, {
                  [this.props.classes.textLineWrap]: !this.props.wrap
                })}
              >
                {this.highlighter(item + append)}
              </div>
            </li>
          );
        })}
        <style jsx>{`
          ul {
            width: ${this.props.width}px;
          }
        `}</style>
      </ul>
    );
  };

  parseDict = dict => {
    var array = [];
    for (const [key, value] of Object.entries(dict)) {
      array.push(key.toString() + ": " + value.toString());
    }
    /*
    if (array.length > 0) {
      return this.parseArray(array);
    } else {
      return "";
    }*/
    return this.parseArray(array);
  };

  /* Special handling for custom column: otherReferencedProductAttributes */
  list_custom1_ToList = obj => {
    var list = [];

    for (var i = 0; i < obj.length; i++) {
      const dict = obj[i];
      const description = dict["Attribute Description"];
      const notes = dict["Notes"];
      const type = dict["Type"];
      const peer = dict["Peer Reviewed"];
      const ref = dict["Reference"];
      const str =
        description +
        ": " +
        notes +
        " (type: " +
        type +
        ", peer-reviewed?: " +
        peer +
        ", reference: " +
        ref +
        ")";
      list.push(str);
    }
    return list;
  };

  render() {
    const {
      className,
      searchText,
      onSearchTextMatch,
      contents,
      dataAppend,
      contentsType,
      classes
    } = this.props;
    var parsedContents;

    const append = dataAppend ? dataAppend : "";

    switch (contentsType) {
      case "list":
        parsedContents = this.parseArray(contents);
        break;
      case "list_custom1":
        const contentsToList = this.list_custom1_ToList(contents);
        parsedContents = this.parseArray(contentsToList);
        break;
      case "dictionary":
        parsedContents = this.parseDict(contents);
        break;
      case "link":
        // i.e. case: string, date, numeric
        parsedContents = (
          <div className={classes.textLine}>
            {this.linkify(this.highlighter(contents.toString() + append))}
          </div>
        );
        break;
      default:
        // i.e. case: string, date, numeric
        parsedContents = (
          <div className={classes.textLine}>
            {this.highlighter(contents.toString() + append)}
          </div>
        );
        break;
    }

    return <div className={className}>{parsedContents}</div>;
  }
}

CellContents.propTypes = {
  searchText: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CellContents);
