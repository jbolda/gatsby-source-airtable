module.exports = {
  siteMetadata: {
    title: 'My Documentation Site',
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-airtable`,
      options: {
        // apiKey: `YOUR_API_KEY`, (set via environment variable for this example)
        tables: [
          {
            baseId: `tblXeAbfG2hYTomd3`,
            tableName: `Sections`,
            tableView: `All`,
            mapping: { Body: 'text/markdown' },
            tableLinks: [`Pages`],
          },
          {
            baseId: `tblXeAbfG2hYTomd3`,
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
