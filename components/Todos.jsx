import React from "react"

const Todos = (props) => (
  <React.Fragment>
    <h1>DEBUG AREA:</h1>
    <p>Search text: {props.searchText}</p>
    <h1>TODOS:</h1>
    <ul>
      <li>Filter: design and add filter functionality to filter sidebar</li>
      <li>Filter: animate display of filter sidebar</li>
      <li>SearchBar: filter down to only rows with relevant results</li>
      <li>.</li>
      <li>Visual: design product summary</li>
      <li>
        Visual: improve display for active ingredients (searchBar highlight
        should still work)
      </li>
      <li>.</li>
      <li>DataTable: make product name sticky on horizontal scroll</li>
      <li>DataTable: clicking row should open product summary</li>
      <li>DataTable: download all button / print preview all selected (?)</li>
      <li>
        DataTable: adjust rowsPerPage to reasonable default and set rowsPerPage
        menu options
      </li>
      <li>DataTable: refactor data preprocessing</li>
      <li>
        DataTable: fix: on hover + click filter icon, Tooltip jumps to top left
        corner
      </li>
      <li>
        DataTable: fix: cell height (embed in fixed height div/Paper which shows
        all on hover?)
      </li>
      <li>.</li>
      <li>TBD: move /static/... files to CDN (?)</li>
    </ul>
  </React.Fragment>
)

export default Todos
