import React from 'react'
import { Link, graphql } from 'gatsby'
import Layout from '../components/layout'

export default ({ data }) => (
  <Layout>
    <h3>{data.airtable.data.Title}</h3>
    <main
      dangerouslySetInnerHTML={{
        __html: data.airtable.data.Body.childMarkdownRemark.html,
      }}
    />
    <p>{data.airtable.data.random_field_doesnt_exist}</p>
    {data.airtable.data.Pages.map(page => 
        <Link to={page.data.Path} key={page.data.Path}>
          <h4>{page.data.Title}</h4>
        </Link>
    )}
  </Layout>
)

export const query = graphql`
  query GetSection($Path: String!) {
    airtable(table: { eq: "Sections" }, data: { Path: { eq: $Path } }) {
      data {
        Title
        Body {
          childMarkdownRemark {
            html
          }
        }
        random_field_doesnt_exist
        Pages {
          data {
            Title
            Path
          }
        }
      }
    }
  }
`
