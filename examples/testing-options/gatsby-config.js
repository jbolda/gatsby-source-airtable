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
            baseId: `appv8dCu3p2PAaA2F`,
            tableName: `Sections`,
            tableView: `All`,
            queryName: `test_default_values`,
            defaultValues: {
              random_field_doesnt_exist: 'This sentence is only in our config. We do not even have a column in Airtable with this name.',
              Body: 'We fill in the body from the _default_.',
              Pages: [`rec4W0c54F3cGvVHh`]
            },
            mapping: { Body: 'text/markdown' },
            tableLinks: [`Pages`],
          },
          {
            baseId: `appv8dCu3p2PAaA2F`,
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
