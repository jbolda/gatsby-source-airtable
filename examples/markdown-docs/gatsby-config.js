module.exports = {
  siteMetadata: {
    title: 'My Documentation Site',
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: process.env.GATSBY_AIRTABLE_API_KEY,
        tables: [
          {
            baseId: `appN0O40W9X0mzbsl`,
            tableName: `Sections`,
            tableView: `All`,
            mapping: { Body: 'text/markdown' },
            tableLinks: [`Pages`],
          },
          {
            baseId: `appN0O40W9X0mzbsl`,
            tableName: `Pages`,
            tableView: `All`,
            mapping: { Body: 'text/markdown' },
            tableLinks: [`Section`],
          },
        ],
      },
    },
  ],
}
