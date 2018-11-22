import Head from "next/head"
import BedBugDataTable from "../components/BedBugDataTable"
import withLayout from "../lib/withLayout"

const Index = () => (
  <React.Fragment>
    <Head>
      <title>Bed Bug Products Table - The Bed Bug Authority</title>
      <meta
        name="description"
        content="This is the description of the Index page"
      />
    </Head>
    <BedBugDataTable />
  </React.Fragment>
)

export default withLayout(Index)
