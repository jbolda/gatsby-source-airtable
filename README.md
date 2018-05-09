# gatsby-source-airtable-linked

Gatsby source plugin for pulling rows from an Airtable. This plugin will allow multiple tables and bases. Additionally, it will link the columns that you manually specify. This was inspired by [gatsby-source-airtable](https://github.com/kevzettler/gatsby-source-airtable), but due to the many breaking changes introduced, I started a new package (pretty much a complete rewrite).

## Install

`npm install --save gatsby-source-airtable-linked`

## How to use

Below is an example showing two tables. `tables` is always specified as an array. The tables may or may not be part of the same base. If you are using a field type of `Link to a Record`, you may specify the field name in `tableLinks` (matching the name shown in Airtable, not the escaped version) and this plugin will create the graphql links for you.

```javascript
// In gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-airtable-linked`,
    options: {
      apiKey: `YOUR_AIRTABLE_KEY`, // may instead specify via env, see below
      tables: [
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_AIRTABLE_NAME`,
          tableView: `YOUR_AIRTABLE_VIEW_NAME`,
          queryName: `OPTIONAL_NAME_TO_IDENTIFY_TABLE`, // optional
          tableLinks: [`ARRAY_OF_STRINGS_REPRESENTING_COLUMN_NAMES`] //optional
        },
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_AIRTABLE_NAME`,
          tableView: `YOUR_AIRTABLE_VIEW_NAME`,
          queryName: `OPTIONAL_NAME_TO_IDENTIFY_TABLE` // optional
        }
      ]
    }
  },
]
```

## API Key

The API key can be specified in `gatsby-config.js` as noted in the previous section. Unfortunately, this exposes your key in your repository which is not great if especially if it is public. In addition, you may specify your API key using an [Environment Variable](https://www.gatsbyjs.org/docs/environment-variables/). This plugin looks for an environment variable called `GATSBY_AIRTABLE_API_KEY` and will use it prior to resorting to the `apiKey` defined in `gatsby-config.js`.

Note: If you add or your change your API key in an environment variable at the system level, you may need to reload your code editor / IDE for that variable to reload. You may also specify it in your command line such as `GATSBY_AIRTABLE_API_KEY=XXXXXX gatsby develop`.

## How to Query

If you are looking for an array of rows, your query may look like below. You can optionally filter based on the table name, etc. if you only want rows from specific tables or bases.

```
{
  allAirtableLinked(filter: {table: {eq: "Table 1"}}) {
    edges {
      node {
        id
        data {
          Column_Names_Matching_Tables
          A_Linked_Field {
            id
            data {etc_data_fields}
          }
        }
      }
    }
  }
}
```

If you are looking for a single record, your query may look like below. It will always only return one record. You can filter down to one specific record. Otherwise, if your filters return more than one record, it will only return the first record.

```
{
  airtableLinked(table: {eq: "Table 1"}, data: {Column_Names_Matching_Tables: {eq: "test2"}}) {
		data {
		  Column_Names_Matching_Tables
		}
  }
}
```
