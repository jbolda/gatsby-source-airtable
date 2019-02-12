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
            baseId: `appN0O40W9X0mzbsl`,
            tableName: `Sections`,
            tableView: `All`,
            queryName: `test_default_values`,
            defaultValues: {
              random_field_doesnt_exist: '#random',
              Body: 'We fill in the body from the _default_.'
            },
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
