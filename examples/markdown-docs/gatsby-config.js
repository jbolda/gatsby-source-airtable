module.exports = {
  siteMetadata: {
    title: 'My Documentation Site',
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-airtable`,
      options: {
        // apiKey: `YOUR_API_KEY`,
        tables: [
          {
            // baseId: `YOUR_BASE_ID`,
            tableName: `Sections`,
            tableView: `All`,
            mapping: { Body: 'text/markdown' },
            tableLinks: [`Pages`],
          },
          {
            // baseId: `YOUR_BASE_ID`,
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
