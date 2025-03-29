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
  
  noteCollection.forEach((v, idx) => {
    console.log(`Processing note: ${v.url}`, {
      title: v.data.title,
      fileSlug: v.fileSlug,
      graphExclude: v.data["dg-graph-exclude"],
      frontMatterContent: v.template?.frontMatter?.content
    });

    if (v.data["dg-graph-exclude"] === true || v.data["dg-graph-exclude"] === "true") {
      console.log(`Excluding note: ${v.url}`);
      excludedNodes.add(v.url);
      return;
    }
    
    let fpath = v.filePathStem.replace("/notes/", "");
    let parts = fpath.split("/");
    let group = "none";
    if (parts.length >= 3) {
      group = parts[parts.length - 2];
    }

    // Fallback to reading file content if template content is not available
    let content = '';
    try {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(__dirname, '..', 'site', 'notes', `${fpath}.md`);
      content = fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      console.error(`Could not read file for ${fpath}:`, error);
    }

    nodes[v.url] = {
      id: idx,
      title: v.data["dg-graph-title"] || v.data.title || v.fileSlug,
      url: v.url,
      group,
      home:
        v.data["dg-home"] ||
        (v.data.tags && v.data.tags.indexOf("gardenEntry") > -1) ||
        false,
      outBound: extractLinks(content || v.template?.frontMatter?.content || '').filter(link => !excludedNodes.has(link)),
      neighbors: new Set(),
      backLinks: new Set(),
      noteIcon: v.data.noteIcon || process.env.NOTE_ICON_DEFAULT,
      hide: v.data.hideInGraph || false,
    };
    console.log(`Node created: ${v.url}`, nodes[v.url]);
    stemURLs[fpath] = v.url;
    if (
      v.data["dg-home"] ||
      (v.data.tags && v.data.tags.indexOf("gardenEntry") > -1)
    ) {
      homeAlias = v.url;
    }
  });
  Object.values(nodes).forEach((node) => {
    let outBound = new Set();
    node.outBound.forEach((olink) => {
      let link = (stemURLs[olink] || olink).split("#")[0];
      if (nodes[link] && !excludedNodes.has(link)) {
        outBound.add(link);
      }
    });
    node.outBound = Array.from(outBound);
    node.outBound.forEach((link) => {
      let n = nodes[link];
      if (n && !excludedNodes.has(n.url)) {
        n.neighbors.add(node.url);
        n.backLinks.add(node.url);
        node.neighbors.add(n.url);
        links.push({ source: node.id, target: n.id });
      }
    });
  });
  Object.keys(nodes).map((k) => {
    nodes[k].neighbors = Array.from(nodes[k].neighbors);
    nodes[k].backLinks = Array.from(nodes[k].backLinks);
    nodes[k].size = nodes[k].neighbors.length;
  });

  console.log('Graph generation result:', {
    homeAlias,
    nodeCount: Object.keys(nodes).length,
    linkCount: links.length
  });

  return {
    homeAlias,
    nodes,
    links,
  };
}

exports.wikiLinkRegex = wikiLinkRegex;
exports.internalLinkRegex = internalLinkRegex;
exports.extractLinks = extractLinks;
exports.getGraph = getGraph;
