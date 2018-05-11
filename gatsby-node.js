const Airtable = require('airtable')
const crypto = require(`crypto`)

exports.sourceNodes = async ({ boundActionCreators },
                             {apiKey, tables}) => {
  // tables contain baseId, tableName, tableView, queryName, tableLinks
  const { createNode, setPluginStatus } = boundActionCreators

  try {
    // hoist api so we can use in scope outside of this block
    var api = await new Airtable({
      apiKey: process.env.GATSBY_AIRTABLE_API_KEY || apiKey,
    })
  }
  catch(e) {
    // airtable uses `assert` which doesn't exit the process,
    //  but rather just makes gatsby hang. Warn, don't create any
    //  nodes, but let gatsby continue working
    console.warn("\nAPI key is required to connect to Airtable")
    return
  };

  // exit if tables is not defined
  if (tables === undefined || tables.length === 0) {
    console.warn("\ntables is not defined for gatsby-source-airtable-linked in gatsby-config.js")
    return
  }

  console.time(`\nfetch all Airtable rows from ${tables.length} tables`)

  let queue = []
  tables.forEach(tableOptions => {
    let base = api.base(tableOptions.baseId)

    let table = base(tableOptions.tableName);

    let query = table.select({
      view: tableOptions.tableView,
    })

    // query.all() returns a promise, pass an array for each table with
    // both our promise and the queryName and then map reduce at the
    // final promise resolution to get queryName onto each row
    queue.push(Promise.all([query.all(),tableOptions.queryName]))
  })

  // queue has array of promises and when resolved becomes nested arrays
  // we flatten the array to return all rows from all tables after mapping
  // the queryName to each row
  const allRows = await Promise.all(queue).then(all => {
    return all.reduce((accumulator, currentValue ) => {
      return accumulator.concat(currentValue[0].map(row => {
          row.queryName = currentValue[1] // this will be queryName from tableOptions above
          return row
        })
      )
    },
      []
    )
  }).catch(e => {
    throw e
    return
  });

  console.timeEnd(`\nfetch all Airtable rows from ${tables.length} tables`)

  setPluginStatus({
    status: {
      lastFetched: new Date().toJSON(),
    },
  })

  allRows.forEach(row => {
    let processedData = processData(row._table.name, row.fields, tables)

    const gatsbyNode = {
      id: `Airtable_${row.id}`,
      parent: null,
      table: row._table.name,
      queryName: row.queryName,
      children: [],
      internal: {
        type: `AirtableLinked`,
        contentDigest: crypto
          .createHash("md5")
          .update(JSON.stringify(row))
          .digest("hex")
      },
      data: processedData
    };

    createNode(gatsbyNode);
  });

  return
}

let processData = (tableName, data, tableOptions) => {
  let tableLinks
  tableOptions.forEach(table => {
    if (table.tableName === tableName) {
      tableLinks = table.tableLinks
    }
  })

  let fieldKeys = Object.keys(data)
  let processedData = {}

  fieldKeys.forEach(key => {
    let useKey
    if (tableLinks && tableLinks.includes(key)) {
      useKey = `${cleanKey(key)}___NODE`
      processedData[useKey] = data[key].map(id => `Airtable_${id}`)
    } else {
      processedData[cleanKey(key)] = data[key]
    }
  })

  return processedData
}

let cleanKey = (key) => {
  return key.replace(/ /g,'_')
}
