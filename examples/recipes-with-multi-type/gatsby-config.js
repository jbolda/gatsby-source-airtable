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
        apiKey: process.env.AIRTABLE_API_KEY_DEV, //(set via environment variable for this example)
        tables: [
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Recipes`,
            queryName: `Recipes`,
            tableView: `List`,
            mapping: {
              Attachments: `fileNode`,
              Ingredients: "text/markdown",
              Directions: "text/markdown"
            },
            tableLinks: [`Cooking_Method`, `Style`],
            separateNodeType: true,
            separateMapType: true
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
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-mdx`,
    `gatsby-plugin-react-helmet`
  ]
};
