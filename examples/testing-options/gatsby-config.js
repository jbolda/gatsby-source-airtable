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
  .get("/v0/appv8dCu3p2PAaA2F/Sections")
  .query({ view: "All" })
  .reply(
    200,
    (uri, requestBody, cb) => {
      fs.readFile("__fixtures__/sections.json", cb); // Error-first callback
    },
    [],
  );

nock("https://api.airtable.com:443", { encodedQueryParams: true })
  .get("/v0/appv8dCu3p2PAaA2F/Pages")
  .query({ view: "All" })
  .reply(
    200,
    (uri, requestBody, cb) => {
      fs.readFile("__fixtures__/pages.json", cb); // Error-first callback
    },
    [],
  );

module.exports = {
  siteMetadata: {
    title: "My Documentation Site",
  },
  plugins: [
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: process.env.AIRTABLE_DEV_API_KEY || "boop", // (set via environment variable for this example)
        tables: [
          {
            baseId: `appv8dCu3p2PAaA2F`,
            tableName: `Sections`,
            tableView: `All`,
            queryName: `test_default_values`,
            defaultValues: {
              random_field_doesnt_exist:
                "This sentence is only in our config. We do not even have a column in Airtable with this name.",
              Body: "We fill in the body from the _default_.",
              Pages: [`rec4W0c54F3cGvVHh`],
            },
            mapping: { Body: "text/markdown" },
            tableLinks: [`Pages`],
          },
          {
            baseId: `appv8dCu3p2PAaA2F`,
            tableName: `Pages`,
            tableView: `All`,
            mapping: { Body: "text/markdown" },
            tableLinks: [`Section`],
          },
        ],
      },
    },
  ],
};
