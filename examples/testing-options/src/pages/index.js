import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/layout'

const IndexPage = ({ data }) => (
  <Layout>
    <h1>Table of Contents</h1>
    {data.allAirtable.edges.map((edge, i) => (
      <Link to={edge.node.data.Path} key={i}>
        <h3>{edge.node.data.Title}</h3>
      </Link>
    ))}
  </Layout>
)

export default IndexPage

export const query = graphql`
  {
    allAirtable(filter: { table: { eq: "Sections" } }) {
      edges {
        node {
          data {
            Title
            Path
          }
        }
      }
    }
  }
`
