import React from "react";
import { Helmet } from "react-helmet";

import Header from "./header";
import "./index.css";

const Layout = ({ children, data }) => (
  <div>
    <Helmet
      title="Gatsby Recipes"
      meta={[
        { name: "description", content: "Sample" },
        { name: "keywords", content: "sample, something" }
      ]}
    />
    <Header siteTitle="Airtable Recipe Site" />
    <div
      style={{
        margin: "0 auto",
        maxWidth: 960,
        padding: "0px 1.0875rem 1.45rem",
        paddingTop: 0
      }}
    >
      {children}
    </div>
  </div>
);

export default Layout;
