const Airtable = require('airtable')
const crypto = require(`crypto`)

exports.sourceNodes = async ({ boundActionCreators },
                             {apiKey, tables}) => {
  // tables contain baseId, tableName, tableView, queryName, tableLinks
  const { createNode, setPluginStatus } = boundActionCreators

  // TODO exit on invalid API key
  const api = new Airtable({
    apiKey: process.env.GATSBY_AIRTABLE_API_KEY || apiKey,
  })

  console.time(`\nfetch all Airtable rows from ${tables.length} tables`)

  let queue = []
  // TODO exit on undefined tables
  tables.forEach(tableOptions => {
    let base = api.base(tableOptions.baseId)

    let table = base(tableOptions.tableName);

    let query = table.select({
      view: tableOptions.tableView,
    })

    queue.push(new Promise((resolve, reject) => {
      resolve(query.all().map(row => {
        row.queryName = tableOptions.queryName
        return row
      }))
    }));
  })

  // queue has array of promises and when resolved becomes nested arrays
  // we flatten the array to return all rows from all tables
  const allRows = await Promise.all(queue).then(all => all.reduce(
    (accumulator, currentValue ) => accumulator.concat(currentValue),
    []
    )
  ).catch(e => {
    throw e
    process.exit(1)
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
