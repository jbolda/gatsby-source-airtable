# gatsby-source-airtable
## We are in process of combining namespaces. This codebase will be used for Gatsby v2 and forward.

[![npm](https://img.shields.io/npm/v/gatsby-source-airtable/latest.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-source-airtable)
[![npm](https://img.shields.io/npm/v/gatsby-source-airtable/next.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-source-airtable)

Gatsby source plugin for pulling rows from an Airtable. This plugin will allow multiple tables and bases. Additionally, it will link the columns that you manually specify. This was inspired by [kevzettler/gatsby-source-airtable](https://github.com/kevzettler/gatsby-source-airtable), but due to the many breaking changes introduced, I started a new package (pretty much a complete rewrite). With the introduction of Gatsby v2, we felt it was a great time to combine the namespaces and this repository will be used moving forward. If you are looking for the documentation on `gatsby-source-airtable-linked`, see the additional branch. We do recommend moving your dependency over to `gatsby-source-airtable` for Gatsby v2. (If you are still on Gatsby v1, see `gatsby-source-airtable-linked` for compatibile code.)

## Install

via npm

`npm install --save gatsby-source-airtable`

or via yarn

`yarn add gatsby-source-airtable`

## How to use

Below is an example showing two tables. `tables` is always specified as an array. The tables may or may not be part of the same base. If you are using a field type of `Link to a Record`, you must specify the field name in `tableLinks` (matching the name shown in Airtable, not the escaped version) for this plugin to create the graphql links for you. Otherwise, you will just receive the Airtable IDs as `strings`. Functionally, Airtable stores the `Link to a Record` fields with IDs pointing to the other tables. When you specify the column name in `tableLinks`, you are signifying to this plugin that that column/field has IDs and you want these IDs linked to the real data that is also in graphql. The name of the column/field does not have to match the related base, but you do need to make sure that the related base is included in your `gatsby-config.js` as well. (We can't link to something that doesn't exist!)

Additionally you may optionally provide a "mapping". This will alert the plugin that column names you specify are of a specific, non-string format. This is particularly useful if you would like to have gatsby pick up the fields for transforming, e.g. `text/markdown`. If you do not provide a mapping, Gatsby will just "infer" what type of value it is, which is most typically a `string`.

Additionally, if you are using the `Attachment` type field in Airtable, you may specify a column name with `fileNode` and the plugin will bring in these files. Using this method, it will create "nodes" for each of the files and expose this to all of the transformer plugins. A good use case for this would be attaching images in Airtable, and being able to make these available for use with the `sharp` plugins and `gatsby-image`. Specifying a `fileNode` does require a peer dependency of `gatsby-source-filesystem` otherwise it will fall back as a non-mapped field. The locally available files and any ecosystem connections will be available on the node as `localFiles`.

```javascript
// In gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-airtable`,
    options: {
      apiKey: `YOUR_AIRTABLE_KEY`, // may instead specify via env, see below
      tables: [
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_AIRTABLE_NAME`,
          tableView: `YOUR_AIRTABLE_VIEW_NAME`,
          queryName: `OPTIONAL_NAME_TO_IDENTIFY_TABLE`, // optional
          mapping: {'COLUMN NAME AS SEEN IN AIRTABLE': `VALUE_FORMAT`}, // optional
          tableLinks: [`ARRAY_OF_STRINGS_REPRESENTING_COLUMN_NAMES`] // optional
        },
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_AIRTABLE_NAME`,
          tableView: `YOUR_AIRTABLE_VIEW_NAME`
          // can leave off queryName, mapping or tableLinks if not needed
        }
      ]
    }
  },
]
```

Within Airtable, there exists your base which has table(s) and each table can have a view(s). A view can either be a different way to see your data, but it can also have embedded filters on your data. Specifying a view allows you to target a specific view (and possibly pre-filter if need be). If you do not specify a view, that airtable just returns the raw data in no particular order.

Additionally, you may have a situation where you are including two separate bases each with a table that has the exact same name. With the data structure of this repo, both bases would fall into allAirtable and you wouldn't be able to tell which from which table each record came. If you need to filter your records down to a specfic table in this situation, you can specify a `queryName` with which to accomplish this. This is only to help separate these records within your gatsby repository. See the How To Query section for an example of filtering.

## API Key

The API key can be specified in `gatsby-config.js` as noted in the previous section. Unfortunately, this exposes your key in your repository which is not great if especially if it is public. In addition, you may specify your API key using an [Environment Variable](https://www.gatsbyjs.org/docs/environment-variables/). This plugin looks for an environment variable called `GATSBY_AIRTABLE_API_KEY` and will use it prior to resorting to the `apiKey` defined in `gatsby-config.js`.

Note: If you add or your change your API key in an environment variable at the system level, you may need to reload your code editor / IDE for that variable to reload. You may also specify it in your command line such as `GATSBY_AIRTABLE_API_KEY=XXXXXX gatsby develop`.

## How to Query

If you are looking for an array of rows, your query may look like below. You can optionally filter based on the table name, etc. if you only want rows from specific tables and/or bases.

```
{
  allAirtable(filter: {table: {eq: "Table 1"}}) {
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

If you are looking for a single record, your query may look like below. It will always only return one record. You can filter down to one specific record as shown in the example. Otherwise, if your filters would return more than one record, it will instead only return the first record.

```
{
  airtable(table: {eq: "Table 1"}, data: {Column_Names_Matching_Tables: {eq: "test2"}}) {
		data {
		  Column_Names_Matching_Tables
		}
  }
}
```
