const nock = require("nock");
const fs = require("fs");
/* helper to create the fixture
// uncomment this, run gatsby build, and it will create a record.txt
// those are nock functions that can be copied below to mock out the API requests

const appendLogToFile = (content) => {
  return fs.appendFileSync("record.txt", content);
};
nock.recorder.rec({
  logging: appendLogToFile,
});
*/

nock("https://api.airtable.com:443", { encodedQueryParams: true })
  .get("/v0/appM8D8wmSJX9WJDE/Recipes")
  .query({ view: "List" })
  .reply(
    200,
    (uri, requestBody, cb) => {
      fs.readFile("__fixtures__/recipes.json", cb); // Error-first callback
    },
    [],
  );

nock("https://api.airtable.com:443", { encodedQueryParams: true })
  .get("/v0/appM8D8wmSJX9WJDE/Cooking%20Method")
  .query({ view: "Main%20View" })
  .reply(
    200,
    (uri, requestBody, cb) => {
      fs.readFile("__fixtures__/cooking_method.json", cb); // Error-first callback
    },
    [],
  );

nock("https://api.airtable.com:443", { encodedQueryParams: true })
  .get("/v0/appM8D8wmSJX9WJDE/Style")
  .query({ view: "Main%20View" })
  .reply(
    200,
    (uri, requestBody, cb) => {
      fs.readFile("__fixtures__/style.json", cb); // Error-first callback
    },
    [],
  );

module.exports = {
  siteMetadata: {
    title: "Gatsby Recipes",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `assets`,
        path: `${__dirname}/src/assets/`,
      },
    },
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: process.env.AIRTABLE_DEV_API_KEY || "boop", //(set via environment variable for this example)
        tables: [
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Recipes`,
            tableView: `List`,
            mapping: { Attachments: `fileNode` },
            tableLinks: [`Cooking Method`, `Style`],
          },
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Cooking Method`,
            tableView: `Main View`,
            tableLinks: [`Recipes`],
          },
          {
            baseId: `appM8D8wmSJX9WJDE`,
            tableName: `Style`,
            tableView: `Main View`,
            tableLinks: [`Recipes`],
          },
        ],
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
    `gatsby-plugin-react-helmet`,
  ],
};
