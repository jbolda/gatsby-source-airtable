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
  .get("/v0/appN0O40W9X0mzbsl/Sections")
  .query({ view: "All" })
  .reply(
    200,
    (uri, requestBody, cb) => {
      fs.readFile("__fixtures__/sections.json", cb); // Error-first callback
    },
    [],
  );

nock("https://api.airtable.com:443", { encodedQueryParams: true })
  .get("/v0/appN0O40W9X0mzbsl/Pages")
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
        apiKey: process.env.AIRTABLE_DEV_API_KEY || "boop", //(set via environment variable for this example)
        tables: [
          {
            baseId: `appN0O40W9X0mzbsl`,
            tableName: `Sections`,
            tableView: `All`,
            mapping: { Body: "text/markdown" },
            tableLinks: [`Pages`],
          },
          {
            baseId: `appN0O40W9X0mzbsl`,
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
