import Link from "next/link"
import Toolbar from "@material-ui/core/Toolbar"
import Grid from "@material-ui/core/Grid"

const headerStyle = {
  display: "block",
  top: 0,
  width: "100%",
  minWidth: 512,
  background: "#FFF",
  WebkitAlignSelf: "stretch",
  alignSelf: "stretch",
}

const headerInnerStyle = {
  display: "-webkit-flex",
  display: "flex",
  WebkitFlex: "1 0 auto",
  flex: "1 0 auto",
  WebkitJustifyContent: "space-between",
  justifyContent: "space-between",
  padding: 8,
  position: "relative",
  width: "100%",
}

const floatLeftStyle = {
  display: "-webkit-flex",
  display: "flex",
  WebkitFlex: "1 1 auto",
  flex: "1 1 auto",
  WebkitAlignSelf: "center",
  alignSelf: "center",
  WebkitAlignItems: "center",
  alignItems: "center",
  verticalAlign: "middle",
  height: 48,
  paddingRight: 32,
}

const floatRightStyle = {
  display: "-webkit-flex",
  display: "flex",
  WebkitFlex: "0 0 auto",
  flex: "0 0 auto",
  WebkitAlignSelf: "center",
  alignSelf: "center",
  WebkitJustifyContent: "flex-end",
  justifyContent: "flex-end",
  verticalAlign: "middle",
  height: 48,
  paddingLeft: 32,
  paddingRight: 4,
}

const imageStyle = {
  height: 48,
  width: 48,
  marginRight: 8,
}

const linkStyle = {
  margin: "auto",
  marginRight: 15,
}

const Header = () => (
  <header style={headerStyle}>
    <div style={headerInnerStyle}>
      <div style={floatLeftStyle}>
        <img
          src="../static/cartoon-bedbug-image-placeholder.jpg"
          style={imageStyle}
        />
        <h1>Bed Bug Authority</h1>
      </div>
      <div style={floatRightStyle}>
        <Link prefetch href="/link1">
          <a style={linkStyle}>Link1</a>
        </Link>
      </div>
    </div>
  </header>
)

export default Header
