const wikiLinkRegex = /\[\[(.*?\|.*?)\]\]/g;
const internalLinkRegex = /href="\/(.*?)"/g;

function caselessCompare(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}

function extractLinks(content) {
  return [
    ...(content.match(wikiLinkRegex) || []).map(
      (link) =>
        link
          .slice(2, -2)
          .split("|")[0]
          .replace(/.(md|markdown)\s?$/i, "")
          .replace("\\", "")
          .trim()
          .split("#")[0]
    ),
    ...(content.match(internalLinkRegex) || []).map(
      (link) =>
        link
          .slice(6, -1)
          .split("|")[0]
          .replace(/.(md|markdown)\s?$/i, "")
          .replace("\\", "")
          .trim()
          .split("#")[0]
    ),
  ];
}

function getGraph(data) {
  console.log('Graph generation started. Collections:', Object.keys(data.collections));
  
  let nodes = {};
  let links = [];
  let stemURLs = {};
  let homeAlias = "/";
  let excludedNodes = new Set();
  
  const noteCollection = data.collections.note || [];
  console.log(`Total notes found: ${noteCollection.length}`);
  
  if (noteCollection.length === 0) {
    console.warn('No notes found in collection. Check eleventy configuration.');
    return Promise.resolve({
      homeAlias: "/",
      nodes: {},
      links: []
    });
  }

  // Use Promise.all to handle async operations
  return Promise.all(noteCollection.map(async (v, idx) => {
    // Get all data we need from the template first
    const templateData = {
      url: v.url || '',
      fileSlug: v.fileSlug || '',
      filePathStem: v.filePathStem || '',
      data: {
        title: v.data?.title || '',
        tags: v.data?.tags || [],
        'dg-home': v.data?.['dg-home'] || false,
        'dg-graph-exclude': v.data?.['dg-graph-exclude'] || false,
        'dg-graph-title': v.data?.['dg-graph-title'] || '',
        noteIcon: v.data?.noteIcon || process.env.NOTE_ICON_DEFAULT,
        hideInGraph: v.data?.hideInGraph || false
      }
    };

    console.log(`Processing note: ${templateData.url}`, {
      title: templateData.data.title,
      fileSlug: templateData.fileSlug,
      graphExclude: templateData.data['dg-graph-exclude']
    });

    if (templateData.data['dg-graph-exclude'] === true || templateData.data['dg-graph-exclude'] === "true") {
      console.log(`Excluding note: ${templateData.url}`);
      excludedNodes.add(templateData.url);
      return null;
    }
    
    let fpath = templateData.filePathStem.replace("/notes/", "");
    let parts = fpath.split("/");
    let group = "none";
    if (parts.length >= 3) {
      group = parts[parts.length - 2];
    }

    // Use the async read() method to get content
    let content = '';
    try {
      content = await v.template.read();
    } catch (error) {
      console.error(`Could not read content for ${templateData.url}:`, error);
    }

    // Extract links from the content
    const outboundLinks = extractLinks(content || '');
    console.log(`Found ${outboundLinks.length} outbound links in ${templateData.url}`);

    nodes[templateData.url] = {
      id: idx,
      title: templateData.data['dg-graph-title'] || templateData.data.title || templateData.fileSlug,
      url: templateData.url,
      group,
      home:
        templateData.data['dg-home'] ||
        (templateData.data.tags && templateData.data.tags.indexOf("gardenEntry") > -1) ||
        false,
      outBound: outboundLinks.filter(link => !excludedNodes.has(link)),
      neighbors: new Set(),
      backLinks: new Set(),
      noteIcon: templateData.data.noteIcon || process.env.NOTE_ICON_DEFAULT,
      hide: templateData.data.hideInGraph || false,
    };

    console.log(`Node created: ${templateData.url} with ID ${idx}`);
    stemURLs[fpath] = templateData.url;
    if (
      templateData.data['dg-home'] ||
      (templateData.data.tags && templateData.data.tags.indexOf("gardenEntry") > -1)
    ) {
      homeAlias = templateData.url;
    }

    return nodes[templateData.url];
  })).then(processedNodes => {
    // Filter out null values (excluded nodes)
    processedNodes = processedNodes.filter(node => node !== null);

    if (processedNodes.length === 0) {
      console.warn('No nodes were created for the graph.');
      return {
        homeAlias,
        nodes: {},
        links: []
      };
    }

    let validLinkCount = 0;
    let invalidLinkCount = 0;
    
    Object.values(nodes).forEach((node) => {
      let outBound = new Set();
      node.outBound.forEach((olink) => {
        let link = (stemURLs[olink] || olink).split("#")[0];
        if (nodes[link] && !excludedNodes.has(link)) {
          outBound.add(link);
          validLinkCount++;
        } else {
          invalidLinkCount++;
          console.log(`Invalid link: ${olink} from node ${node.url}`);
        }
      });
      node.outBound = Array.from(outBound);
      node.outBound.forEach((link) => {
        let n = nodes[link];
        if (n && !excludedNodes.has(n.url)) {
          n.neighbors.add(node.url);
          n.backLinks.add(node.url);
          node.neighbors.add(n.url);
          links.push({ 
            source: node.id, 
            target: n.id,
            value: 1  // Add a default weight
          });
          console.log(`Added link from ${node.id} (${node.url}) to ${n.id} (${n.url})`);
        }
      });
    });

    // Convert Set objects to Arrays for JSON serialization
    Object.values(nodes).forEach(node => {
      node.neighbors = Array.from(node.neighbors);
      node.backLinks = Array.from(node.backLinks);
    });

    console.log(`Graph generation complete. Valid links: ${validLinkCount}, Invalid links: ${invalidLinkCount}`);
    return {
      homeAlias,
      nodes,
      links
    };
  });
}

exports.wikiLinkRegex = wikiLinkRegex;
exports.internalLinkRegex = internalLinkRegex;
exports.extractLinks = extractLinks;
exports.getGraph = getGraph;
