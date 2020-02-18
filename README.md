# gatsby-source-airtable

[![npm](https://img.shields.io/npm/v/gatsby-source-airtable/latest.svg?style=flat-square)](https://www.npmjs.com/package/gatsby-source-airtable)
[![Build Status](https://travis-ci.com/jbolda/gatsby-source-airtable.svg?branch=master)](https://travis-ci.com/jbolda/gatsby-source-airtable)

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
      concurrency: 5, // default, see using markdown and attachments for more information
      tables: [
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_TABLE_NAME`,
          tableView: `YOUR_TABLE_VIEW_NAME`, // optional
          queryName: `OPTIONAL_NAME_TO_IDENTIFY_TABLE`, // optionally default is false - makes all records in this table a separate node type, based on your tableView, or if not present, tableName, e.g. a table called "Fruit" would become "allAirtableFruit". Useful when pulling many airtables with similar structures or fields that have different types. See https://github.com/jbolda/gatsby-source-airtable/pull/52.
          mapping: { `CASE_SENSITIVE_COLUMN_NAME`: `VALUE_FORMAT` }, // optional, e.g. "text/markdown", "fileNode"
          tableLinks: [`CASE`, `SENSITIVE`, `COLUMN`, `NAMES`] // optional, for deep linking to records across tables.
          createSeparateNodeType: false, // boolean, default is false, see the documentation on naming conflicts for more information
          separateMapType: false, // boolean, default is false, see the documentation on using markdown and attachments for more information
        },
        {
          baseId: `YOUR_AIRTABLE_BASE_ID`,
          tableName: `YOUR_TABLE_NAME`,
          tableView: `YOUR_TABLE_VIEW_NAME` // optional
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

For an example of a markdown-and-airtable-driven site using `gatsby-transformer-remark`, see the examples folder in this repo.

If you are using the `Attachment` type field in Airtable, you may specify a column name with `fileNode` and the plugin will bring in these files. Using this method, it will create "nodes" for each of the files and expose this to all of the transformer plugins. A good use case for this would be attaching images in Airtable, and being able to make these available for use with the `sharp` plugins and `gatsby-image`. Specifying a `fileNode` does require a peer dependency of `gatsby-source-filesystem` otherwise it will fall back as a non-mapped field. The locally available files and any ecosystem connections will be available on the node as `localFiles`.

If you are specifying more than one type of `mapping`, you may potentially run into issues with data types clashing and throwing errors. An additional option that you may specify is `separateMapType` which will create a gatsby node type for each type of data. This should prevent issues with your data types clashing.

When using the Attachment type field, this plugin governs requests to download the associated files from Airtable to 5 concurrent requests to prevent excessive requests on Airtable's servers - which can result in refused / hanging connections. You can adjust this limit with the concurrency option in your gatsby-config.js file. Set the option with an integer value for your desired limit on attempted concurrent requests. A value of 0 will allow requests to be made without any limit.

### The power of views

Within Airtable, every table can have one or more named Views. These Views are a convenient way to pre-filter and sort your data before querying it in Gatsby. If you do not specify a view in your table object, raw data will be returned in no particular order.

For example, if you are creating a blog or documentation site, specify a `published` field in Airtable, create a filter showing only published posts, and specify this as the (optional) `tableView` option in `gatsby-config.js`

### Naming conflicts

You may have a situation where you are including two separate bases, each with a table that has the exact same name. With the data structure of this repo, both bases would fall into allAirtable and you wouldn't be able to tell them apart when building graphQL queries. This is what the optional `queryName` setting is for-- simply to provide an alternate name for a table.

If you would like to have the query names for tables be different from the default `allAirtable` or `airtable`, you may specify `createSeparateNodeType` as `true`.

### Column Names

Within graphql (the language you query information from and that this plugin puts nodes into), there are character limitations. Most specifically we cannot have spaces in field names. We don't want to force you to change your Airtable names, so we will "clean" the keys and replace the spaces with an underscore (e.g. The Column Name becomes The_Column_Name). We use the cleaned name everywhere including `gatsby-config.js` and within your queries. We don't warn you when this happens to cut down on the verbosity of the output.

### API Keys

Keys can be found in Airtable by clicking `Help > API Documentation`.

The API key can be hard coded directly in `gatsby-config.js` as noted in the previous section-- **this exposes your key to anyone viewing your repository and is not recommended. You should inject your API key as recommended below to prevent it from being committed to source control**.

We recommended specifying your API key using an [Environment Variable](https://www.gatsbyjs.org/docs/environment-variables/). You may also specify it in your command line such as `AIRTABLE_API_KEY=XXXXXX gatsby develop`. Note: If you use an environment variable prepended with `GATSBY_`, it takes advantage of some syntactic sugar courtesy of Gatsby, which automatically makes it available - but any references to environment variables like this that are rendered client-side will **automatically** expose your API key within the browser. To avoid accidentally exposing it, we recommend *not* prepending it with `GATSBY_`.

To be safe, you can also setup your API key via a config variable, `apiKey` defined in `gatsby-config.js`. This is the recommended way to inject your API key.

```javascript
// In gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-airtable`,
    options: {
      //not prefaced with "GATSBY_", will not automatically be included client-side unless you explicitly expose it
      apiKey: process.env.AIRTABLE_API_KEY
      //...etc
    }
  }
]
```

You can either use a node tool like "dotenv" to load secrets like your Airtable API key from a .env file, or you can specify it in your command line such as `AIRTABLE_API_KEY=XXXXXX gatsby develop`.

If you add or change your API key in an environment variable at the system level, you may need to reload your code editor / IDE for that variable to reload.

### Columns without any values (yet)

If you want to perform conditional logic based on data that may or may not be present in Airtable, but you do not yet have tabular data for the "may" case, you can update the gatsby-source-airtable section of `gatsby-config.js` to include sensible defaults for those fields
so that they will be returned via your graphql calls:

```javascript
// In gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-airtable`,
    options: {
      apiKey: process.env.AIRTABLE_API_KEY,
      tables: [
        {
          baseId: process.env.AIRTABLE_BASE,
          tableName: process.env.AIRTABLE_TABLE_NAME,
          defaultValues: {
            //currently does not accept null / undefined. use empty string instead
            //and perform your conditional logic on name_of_field.length > 0 ? condition_1 : condition_2
            NAME_OF_FIELD_THAT_WILL_OTHERWISE_NOT_BE_RETURNED_IF_ALL_VALUES_ARE_BLANK: ""
            //... etc
          }
        }
      ]
    }
  }
];
```

## History

A Gatsby source plugin for pulling rows from multiple tables and bases in Airtable. This was originally inspired by [kevzettler/gatsby-source-airtable](https://github.com/kevzettler/gatsby-source-airtable) and eventually superseeded the original plugin with the introduction of Gatsby v2.

If you are looking for the documentation on `gatsby-source-airtable-linked`, see the additional branch. We do recommend moving your dependency over to this plugin, `gatsby-source-airtable`, for Gatsby v2. (If you are still on Gatsby v1, see `gatsby-source-airtable-linked` for compatible code.)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.jacobbolda.com"><img src="https://avatars2.githubusercontent.com/u/2019387?v=4" width="100px;" alt=""/><br /><sub><b>Jacob Bolda</b></sub></a><br /><a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=jbolda" title="Code">💻</a> <a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=jbolda" title="Documentation">📖</a> <a href="https://github.com/jbolda/gatsby-source-airtable/pulls?q=is%3Apr+reviewed-by%3Ajbolda" title="Reviewed Pull Requests">👀</a> <a href="#question-jbolda" title="Answering Questions">💬</a> <a href="#ideas-jbolda" title="Ideas, Planning, & Feedback">🤔</a> <a href="#example-jbolda" title="Examples">💡</a> <a href="https://github.com/jbolda/gatsby-source-airtable/issues?q=author%3Ajbolda" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/brendanmc6"><img src="https://avatars3.githubusercontent.com/u/9867865?v=4" width="100px;" alt=""/><br /><sub><b>Brendan McGill</b></sub></a><br /><a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=brendanmc6" title="Code">💻</a> <a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=brendanmc6" title="Documentation">📖</a> <a href="#example-brendanmc6" title="Examples">💡</a> <a href="https://github.com/jbolda/gatsby-source-airtable/issues?q=author%3Abrendanmc6" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.jamessimone.net"><img src="https://avatars2.githubusercontent.com/u/16430727?v=4" width="100px;" alt=""/><br /><sub><b>James Simone</b></sub></a><br /><a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=jamessimone" title="Code">💻</a> <a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=jamessimone" title="Documentation">📖</a> <a href="https://github.com/jbolda/gatsby-source-airtable/issues?q=author%3Ajamessimone" title="Bug reports">🐛</a> <a href="#question-jamessimone" title="Answering Questions">💬</a> <a href="https://github.com/jbolda/gatsby-source-airtable/pulls?q=is%3Apr+reviewed-by%3Ajamessimone" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="http://brianjon.es"><img src="https://avatars0.githubusercontent.com/u/507511?v=4" width="100px;" alt=""/><br /><sub><b>Brian Jones</b></sub></a><br /><a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=jonesbp" title="Code">💻</a> <a href="https://github.com/jbolda/gatsby-source-airtable/issues?q=author%3Ajonesbp" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/christopherfrance"><img src="https://avatars0.githubusercontent.com/u/7366?v=4" width="100px;" alt=""/><br /><sub><b>Christopher Blow France</b></sub></a><br /><a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=christopherfrance" title="Documentation">📖</a> <a href="https://github.com/jbolda/gatsby-source-airtable/issues?q=author%3Achristopherfrance" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://twitter.com/eunjae_lee"><img src="https://avatars3.githubusercontent.com/u/499898?v=4" width="100px;" alt=""/><br /><sub><b>Eunjae Lee</b></sub></a><br /><a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=eunjae-lee" title="Code">💻</a> <a href="https://github.com/jbolda/gatsby-source-airtable/commits?author=eunjae-lee" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!