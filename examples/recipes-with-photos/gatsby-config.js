module.exports = {
  siteMetadata: {
    title: "Gatsby Recipes"
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `assets`,
        path: `${__dirname}/src/assets/`
      }
    },
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: process.env.GATSBY_AIRTABLE_API_KEY,
        tables: [
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Recipes`,
            tableView: `List`,
            mapping: { Attachments: `fileNode` },
            tableLinks: [`Cooking Method`, `Style`]
          },
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Cooking Method`,
            tableView: `Main View`,
            tableLinks: [`Recipes`]
          },
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Style`,
            tableView: `Main View`,
            tableLinks: [`Recipes`]
          }
        ]
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-react-helmet`
  ]
};
