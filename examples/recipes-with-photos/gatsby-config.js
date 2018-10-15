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
        tables: [
          {
            baseId: `tbl1zhB7g2q3NXALg`,
            tableName: `Recipes`,
            tableView: `List`,
            mapping: { Attachments: `fileNode` },
            tableLinks: [`Cooking Method`, `Style`]
          },
          {
            baseId: `tbl1zhB7g2q3NXALg`,
            tableName: `Cooking Method`,
            tableView: `Main View`,
            tableLinks: [`Recipes`]
          },
          {
            baseId: `tbl1zhB7g2q3NXALg`,
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
