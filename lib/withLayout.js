/* eslint-disable */
import PropTypes from "prop-types";
import { MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import getContext from "../lib/context";

function withLayout(BaseComponent) {
  class App extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.pageContext = this.props.pageContext || getContext();
    }

    componentDidMount() {
      const jssStyles = document.querySelector("#jss-server-side");
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      return (
        <MuiThemeProvider
          theme={this.pageContext.theme}
          sheetsManager={this.pageContext.sheetsManager}
        >
          <CssBaseline />
          <BaseComponent {...this.props} />
        </MuiThemeProvider>
      );
    }
  }

  App.propTypes = {
    pageContext: PropTypes.object // eslint-disable-line
  };

  App.defaultProps = {
    pageContext: null
  };

  App.getInitialProps = ctx => {
    if (BaseComponent.getInitialProps) {
      return BaseComponent.getInitialProps(ctx);
    }

    return {};
  };

  return App;
}

export default withLayout;
