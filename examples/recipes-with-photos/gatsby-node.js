const path = require(`path`);

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  let slug;

  if (node.internal.type === `Airtable` && node.table === `Recipes`) {
    slug = `/${node.data.Name.replace(/ /g, "-")
      .replace(/[,&]/g, "")
      .toLowerCase()}/`;

    // Add slug as a field on the node.
    createNodeField({ node, name: `slug`, value: slug });
  }
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions;

  return new Promise((resolve, reject) => {
    const pages = [];
    const atRecipes = path.resolve(`src/templates/recipeTemplate.js`);

    // Query for all markdown "nodes" and for the slug we previously created.
    resolve(
      graphql(
        `
          {
            allAirtable(filter: { table: { eq: "Recipes" } }) {
              edges {
                node {
                  id
                  data {
                    Name
                  }
                  fields {
                    slug
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          result.errors.forEach(error => {
            console.log(error);
          });

          reject(result.errors);
        }

        result.data.allAirtable.edges.forEach(edge => {
          createPage({
            path: edge.node.fields.slug, // required, we don't have frontmatter for this page hence separate if()
            component: atRecipes,
            context: {
              name: edge.node.data.Name
            }
          });
        });

        return;
      })
    );
  });
};
