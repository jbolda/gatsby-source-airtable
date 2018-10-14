## We are in process of combining namespaces. This codebase will be used for Gatsby v2 and forward.

[![npm](https://img.shields.io/npm/v/gatsby-source-airtable/latest.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-source-airtable)
[![npm](https://img.shields.io/npm/v/gatsby-source-airtable/next.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-source-airtable)
[![Build Status](https://travis-ci.com/jbolda/gatsby-source-airtable.svg?branch=master)](https://travis-ci.com/jbolda/gatsby-source-airtable)

Gatsby source plugin for pulling rows from multiple tables and bases in Airtable. This was inspired by [kevzettler/gatsby-source-airtable](https://github.com/kevzettler/gatsby-source-airtable), but due to the many breaking changes introduced, I started a new package (pretty much a complete rewrite). With the introduction of Gatsby v2, we felt it was a great time to combine the namespaces and this repository will be used moving forward. If you are looking for the documentation on `gatsby-source-airtable-linked`, see the additional branch. We do recommend moving your dependency over to this plugin, `gatsby-source-airtable`, for Gatsby v2. (If you are still on Gatsby v1, see `gatsby-source-airtable-linked` for compatible code.)

## Install

via npm

`npm install --save gatsby-source-airtable`

or via yarn

`yarn add gatsby-source-airtable`

## Example

Getting data from two different tables:

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
          tableName: `YOUR_TABLE_NAME`,
          tableView: `YOUR_TABLE_VIEW_NAME`,
          queryName: `OPTIONAL_NAME_TO_IDENTIFY_TABLE`, // optional
          mapping: { `CASE_SENSITIVE_COLUMN_NAME`: `VALUE_FORMAT` }, // optional, e.g. "text/markdown", "fileNode"
          tableLinks: [`CASE`, `SENSITIVE`, `COLUMN`, `NAMES`] // optional, for deep linking to records across tables.
        },
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_TABLE_NAME`,
          tableView: `YOUR_TABLE_VIEW_NAME`
          // can leave off queryName, mapping or tableLinks if not needed
        }
      ]
    }
  }
];
```

Get one single record (table row), where `Field_1 === YOUR_VALUE`

```
{
  airtable(table: {eq: "YOUR_TABLE_NAME"}, data: {Field_1: {eq: "YOUR_VALUE"}}) {
    data {
      Field_1
      Field_2
      Linked_Field {
        data {
          Linked_Field_1
        }
      }
    }
  }
}
```

Get all records from `YOUR_TABLE_NAME` where `Field_1 === YOUR_VALUE`

```
{
  allAirtable(filter: {table: {eq: "YOUR_TABLE_NAME"}, data: {Field_1: {eq: "YOUR_VALUE"}}}) {
    edges {
      node {
        data {
          Field_1
          ...
        }
      }
    }
  }
}
```

## How it works

When running `gatsby develop` or `gatsby build`, this plugin will fetch all data for all rows in each of the tables you specify, making them available for query throughout your gatsby.js app, and to other Gatsby plugins as well.

As seen in the example above, `tables` is always specified as an array of table objects. These tables may be sourced from different bases.

Querying for `airtable` will always only return one record (defaulting to the first record in the table), and querying for `allAirtable` will return any records that match your query parameters.

As in the examples above, you can narrow your query by filtering for table names, and field values.

### Deep linking across tables

One powerful feature of Airtable is the ability to specify fields which link to records in other tables-- the `Link to a Record` field type. If you wish to query data from a linked record, you must specify the field name in `tableLinks` (matching the name shown in Airtable, not the escaped version).

This will create nested nodes accessible in your graphQL queries, as shown in the above example. If you do not specify a linked field in `tableLinks`, you will just receive the linked record's Airtable IDs as `strings`. The name of the column/field does not have to match the related table, but you do need to make sure that the related table is included as an object in your `gatsby-config.js` as well.

### Using markdown and attachments

Optionally, you may provide a "mapping". This will alert the plugin that column names you specify are of a specific, non-string format of your choosing. This is particularly useful if you would like to have Gatsby pick up the fields for transforming, e.g. `text/markdown`. If you do not provide a mapping, Gatsby will just "infer" what type of value it is, which is most typically a `string`.

For an example of a markdown-and-airtable driven site using `gatsby-transformer-remark`, see the examples folder in this repo.

If you are using the `Attachment` type field in Airtable, you may specify a column name with `fileNode` and the plugin will bring in these files. Using this method, it will create "nodes" for each of the files and expose this to all of the transformer plugins. A good use case for this would be attaching images in Airtable, and being able to make these available for use with the `sharp` plugins and `gatsby-image`. Specifying a `fileNode` does require a peer dependency of `gatsby-source-filesystem` otherwise it will fall back as a non-mapped field. The locally available files and any ecosystem connections will be available on the node as `localFiles`.

### The power of views

Within Airtable, every table can have one or more named Views. These Views are a convenient way to pre-filter and sort your data before querying it in Gatsby. If you do not specify a view in your table object, raw data will be returned in no particular order.

For example, if you are creating a blog or documentation site, specify a `published` field in Airtable, create a filter showing only published posts, and specify this as `tableView` in `gatsby-config.js`

### Naming conflicts

You may have a situation where you are including two separate bases, each with a table that has the exact same name. With the data structure of this repo, both bases would fall into allAirtable and you wouldn't be able to tell them apart when building graphQL queries. This is what the optional `queryName` setting is for-- simply to provide an alternate name for a table.

### API Keys

Keys can be found in Airtable by clicking `Help > API Documentation`.

The API key can be specified in `gatsby-config.js` as noted in the previous section-- **this exposes your key to anyone viewing your repository and is not recommended**.

Alternatively, you may specify your API key using an [Environment Variable](https://www.gatsbyjs.org/docs/environment-variables/). This plugin looks for an environment variable called `GATSBY_AIRTABLE_API_KEY` and will use it prior to resorting to the `apiKey` defined in `gatsby-config.js`. You may also specify it in your command line such as `GATSBY_AIRTABLE_API_KEY=XXXXXX gatsby develop`.

If you add or your change your API key in an environment variable at the system level, you may need to reload your code editor / IDE for that variable to reload.
