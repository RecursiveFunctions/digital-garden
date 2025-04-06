const wikiLinkRegex = /\[\[(.*?\|.*?)\]\]/g;
const internalLinkRegex = /href="\/(.*?)"/g;
const matter = require('gray-matter');

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

async function getGraph(data) {
  console.log('Graph generation started. Collections:', Object.keys(data.collections));
  
  let nodes = {};
  let links = [];
  let stemURLs = {};
  let homeAlias = "/";
  let excludedNodes = new Set();
  
  const noteCollection = data.collections.note || [];
  console.log(`Total notes found: ${noteCollection.length}`);
  
  if (!noteCollection.length) {
    console.warn('No notes found in collection. Check eleventy configuration.');
    return {
      homeAlias: "/",
      nodes: {},
      links: []
    };
  }

  // Process each note in sequence to avoid overwhelming the system
  for (let idx = 0; idx < noteCollection.length; idx++) {
    const note = noteCollection[idx];
    
    // Get content and frontmatter safely
    let content = '';
    let frontMatter = {};
    try {
      const fs = require('fs');
      const rawContent = fs.readFileSync(note.inputPath, 'utf8');
      const parsed = matter(rawContent);
      content = parsed.content;
      frontMatter = parsed.data;
    } catch (error) {
      console.error(`Could not read content for ${note.inputPath}:`, error);
      continue;
    }

    // Extract safe data, prioritizing frontmatter over note data
    const safeData = {
      url: frontMatter.permalink || note.url || '',
      fileSlug: note.fileSlug || '',
      filePathStem: note.filePathStem || '',
      inputPath: note.inputPath || '',
      data: {
        title: frontMatter.title || note.data?.title || '',
        tags: Array.isArray(frontMatter.tags || note.data?.tags) ? [...(frontMatter.tags || note.data?.tags)] : [],
        'dg-home': frontMatter['dg-home'] || note.data?.['dg-home'] || false,
        'dg-graph-exclude': frontMatter['dg-graph-exclude'] || note.data?.['dg-graph-exclude'] || false,
        'dg-graph-title': frontMatter['dg-graph-title'] || note.data?.['dg-graph-title'] || '',
        noteIcon: frontMatter.noteIcon || note.data?.noteIcon || process.env.NOTE_ICON_DEFAULT,
        hideInGraph: frontMatter.hide || note.data?.hideInGraph || false
      }
    };

    console.log(`Processing note: ${safeData.url}`, {
      title: safeData.data.title,
      fileSlug: safeData.fileSlug,
      graphExclude: safeData.data['dg-graph-exclude']
    });

    if (safeData.data['dg-graph-exclude'] === true || safeData.data['dg-graph-exclude'] === "true") {
      console.log(`Excluding note: ${safeData.url}`);
      excludedNodes.add(safeData.url);
      continue;
    }
    
    let fpath = safeData.filePathStem.replace("/notes/", "");
    let parts = fpath.split("/");
    let group = "none";
    if (parts.length >= 3) {
      group = parts[parts.length - 2];
    }

    // Extract links from the content
    const outboundLinks = extractLinks(content || '');
    console.log(`Found ${outboundLinks.length} outbound links in ${safeData.url}`);

    nodes[safeData.url] = {
      id: idx,
      title: safeData.data['dg-graph-title'] || safeData.data.title || safeData.fileSlug,
      url: safeData.url,
      group,
      home:
        safeData.data['dg-home'] ||
        (safeData.data.tags && safeData.data.tags.indexOf("gardenEntry") > -1) ||
        false,
      outBound: outboundLinks.filter(link => !excludedNodes.has(link)),
      neighbors: new Set(),
      backLinks: new Set(),
      noteIcon: safeData.data.noteIcon || process.env.NOTE_ICON_DEFAULT,
      hide: safeData.data.hideInGraph || false,
    };

    console.log(`Node created: ${safeData.url} with ID ${idx}`);
    stemURLs[fpath] = safeData.url;
    if (
      safeData.data['dg-home'] ||
      (safeData.data.tags && safeData.data.tags.indexOf("gardenEntry") > -1)
    ) {
      homeAlias = safeData.url;
    }
  }

  // Process links after all nodes are created
  if (Object.keys(nodes).length === 0) {
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
          value: 1
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
}

exports.wikiLinkRegex = wikiLinkRegex;
exports.internalLinkRegex = internalLinkRegex;
exports.extractLinks = extractLinks;
exports.getGraph = getGraph;
