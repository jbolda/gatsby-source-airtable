const path = require(`path`)

exports.createPages = ({ graphql, actions }) => {
  // createPage is a built in action,
  // available to all gatsby-node exports
  const { createPage } = actions
  return new Promise(async resolve => {
    // we need the table name (e.g. "Sections")
    // as well as the unique path for each Page/Section.
    const result = await graphql(`
      {
        allAirtable {
          edges {
            node {
              table
              data {
                Path
              }
            }
          }
        }
      }
    `)
    // For each path, create a page and decide which template to use.
    // values inside the context Object are available in the page's query
    result.data.allAirtable.edges.forEach(({ node }) => {
      const isPage = node.table === 'Pages'
      createPage({
        path: node.data.Path,
        component: isPage
          ? path.resolve(`./src/templates/page-template.js`)
          : path.resolve(`./src/templates/section-template.js`),
        context: {
          Path: node.data.Path,
        },
      })
    })
    resolve()
  })
}

// You can delete this file if you're not using it
