const Airtable = require('airtable')
const crypto = require(`crypto`)

exports.sourceNodes = async ({ boundActionCreators },
                             {apiKey, tables}) => {
  // tables contain baseId, tableName, tableView, queryName, mapping, tableLinks
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
    queue.push(Promise.all([
      query.all(),
      tableOptions.queryName,
      tableOptions.mapping,
      tableOptions.tableLinks
    ]))
  })

  // queue has array of promises and when resolved becomes nested arrays
  // we flatten the array to return all rows from all tables after mapping
  // the queryName to each row
  const allRows = await Promise.all(queue).then(all => {
    return all.reduce((accumulator, currentValue ) => {
      return accumulator.concat(currentValue[0].map(row => {
          row.queryName = currentValue[1] // queryName from tableOptions above
          row.mapping = currentValue[2] // mapping from tableOptions above
          row.tableLinks = currentValue[3] // tableLinks from tableOptions above
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
    let childNodes = []
    let processedData = processData(row, childNodes)

    const node = {
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

    createNode(node);
    childNodes.forEach(node => createNode(node))
  });

  return
}

/* #################
  helper functions
################## */


let processData = (row, childNodes) => {
  let tableName = row._table.name
  let data = row.fields
  let mapping = row.mapping
  let tableLinks = row.tableLinks

  let fieldKeys = Object.keys(data)
  let processedData = {}

  fieldKeys.forEach(key => {
    let useKey
    if (tableLinks && tableLinks.includes(key)) {
      useKey = `${cleanKey(key)}___NODE`
      processedData[useKey] = data[key].map(id => `Airtable_${id}`)
    } else {
      let checkedChildNode = checkChildNode(key, row, childNodes)
      processedData[checkedChildNode.key] = checkedChildNode.value
    }
  })

  return processedData
}


let checkChildNode = (key, row, childNodes) => {
  let data = row.fields
  let mapping = row.mapping
  let cleanedKey = cleanKey(key)

  if (mapping && mapping[key]) {
    const node = {
      id: `AirtableField_${row.id}_${cleanedKey}`,
      parent: `Airtable_${row.id}`,
      children: [],
      raw: data[key],
      internal: {
        type: `AirtableField`,
        mediaType: mapping[key],
        content: data[key],
        contentDigest: crypto
          .createHash("md5")
          .update(JSON.stringify(row))
          .digest("hex")
      }
    };

    childNodes.push(node)
    return {key: `${cleanedKey}___NODE`, value: `AirtableField_${row.id}_${cleanedKey}`}
  } else {
    return {key: cleanedKey, value: data[key]}
  }
}


let cleanKey = (key, data) => {
  return key.replace(/ /g,'_')
}
