const Airtable = require("airtable");
const crypto = require(`crypto`);
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

exports.sourceNodes = async (
  { actions, createNodeId, store, cache },
  { apiKey, tables }
) => {
  // tables contain baseId, tableName, tableView, queryName, mapping, tableLinks
  const { createNode, setPluginStatus } = actions;

  try {
    // hoist api so we can use in scope outside of this block
    var api = await new Airtable({
      apiKey: process.env.GATSBY_AIRTABLE_API_KEY || apiKey
    });
  } catch (e) {
    // airtable uses `assert` which doesn't exit the process,
    //  but rather just makes gatsby hang. Warn, don't create any
    //  nodes, but let gatsby continue working
    console.warn("\nAPI key is required to connect to Airtable");
    return;
  }

  // exit if tables is not defined
  if (tables === undefined || tables.length === 0) {
    console.warn(
      "\ntables is not defined for gatsby-source-airtable in gatsby-config.js"
    );
    return;
  }

  console.time(`\nfetch all Airtable rows from ${tables.length} tables`);

  let queue = [];
  tables.forEach(tableOptions => {
    let base = api.base(tableOptions.baseId);

    let table = base(tableOptions.tableName);

    let query = table.select({
      view: tableOptions.tableView
    });

    // query.all() returns a promise, pass an array for each table with
    // both our promise and the queryName and then map reduce at the
    // final promise resolution to get queryName onto each row
    queue.push(
      Promise.all([
        query.all(),
        tableOptions.queryName,
        tableOptions.mapping,
        tableOptions.tableLinks
      ])
    );
  });

  // queue has array of promises and when resolved becomes nested arrays
  // we flatten the array to return all rows from all tables after mapping
  // the queryName to each row
  const allRows = await Promise.all(queue)
    .then(all => {
      return all.reduce((accumulator, currentValue) => {
        return accumulator.concat(
          currentValue[0].map(row => {
            row.queryName = currentValue[1]; // queryName from tableOptions above
            row.mapping = currentValue[2]; // mapping from tableOptions above
            row.tableLinks = currentValue[3]; // tableLinks from tableOptions above
            return row;
          })
        );
      }, []);
    })
    .catch(e => {
      throw e;
      return;
    });

  console.timeEnd(`\nfetch all Airtable rows from ${tables.length} tables`);

  setPluginStatus({
    status: {
      lastFetched: new Date().toJSON()
    }
  });

  await allRows.forEach(async row => {
    let childNodes = [];
    let processedData = processData(row, childNodes, {
      createNodeId,
      createNode,
      store,
      cache
    });

    const node = {
      id: createNodeId(`Airtable_${row.id}`),
      parent: null,
      table: row._table.name,
      queryName: row.queryName,
      children: [],
      internal: {
        type: `Airtable`,
        contentDigest: crypto
          .createHash("md5")
          .update(JSON.stringify(row))
          .digest("hex")
      },
      data: processedData
    };

    await createNode(node);
    childNodes.forEach(node => createNode(node));
  });

  return;
};

const processData = (
  row,
  childNodes,
  { createNodeId, createNode, store, cache }
) => {
  let data = row.fields;
  let tableLinks = row.tableLinks;

  let fieldKeys = Object.keys(data);
  let processedData = {};

  fieldKeys.forEach(key => {
    let useKey;
    // deals with airtable linked fields,
    // these will be airtable IDs
    if (tableLinks && tableLinks.includes(key)) {
      useKey = `${cleanKey(key)}___NODE`;
      processedData[useKey] = data[key].map(id =>
        createNodeId(`Airtable_${id}`)
      );
      // A child node comes from the mapping, where we want to
      // define a separate node in gatsby that is available
      // for transforming. This will let other plugins pick
      // up on that node to add nodes.
    } else {
      checkChildNode(key, row, childNodes, processedData, {
        createNodeId,
        createNode,
        store,
        cache
      });
    }
  });

  return processedData;
};

const checkChildNode = (
  key,
  row,
  childNodes,
  processedData,
  { createNodeId, createNode, store, cache }
) => {
  let data = row.fields;
  let mapping = row.mapping;
  let cleanedKey = cleanKey(key);

  if (mapping && mapping[key]) {
    let node = {
      id: createNodeId(`AirtableField_${row.id}_${cleanedKey}`),
      parent: createNodeId(`Airtable_${row.id}`),
      children: [],
      raw: data[key],
      internal: {
        type: `AirtableField`,
        mediaType: mapping[key],
        content: JSON.stringify(data[key]),
        contentDigest: crypto
          .createHash("md5")
          .update(JSON.stringify(row))
          .digest("hex")
      }
    };

    if (mapping[key] === `fileNode`) {
      try {
        let fileNodes = [];
        // where data[key] is the array of attachments
        data[key].forEach(async attachment => {
          const node = await createRemoteFileNode({
            url: attachment.url,
            store,
            cache,
            createNode,
            createNodeId
          });
          childNodes.push(node);
          fileNodes.push(node.id);
        });
        // Adds a field `localFile` to the node
        // ___NODE tells Gatsby that this field will link to another nodes
        node.localFiles___NODE = fileNodes;
      } catch (e) {
        // Ignore
      }
    }

    childNodes.push(node);
    processedData[`${cleanedKey}___NODE`] = createNodeId(
      `AirtableField_${row.id}_${cleanedKey}`
    );
    return;
  } else {
    processedData[cleanedKey] = data[key];
    return;
  }
};

const cleanKey = (key, data) => {
  return key.replace(/ /g, "_");
};
