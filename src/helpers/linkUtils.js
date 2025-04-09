const wikiLinkRegex = /\[\[(.*?\|.*?)\]\]/g;
const internalLinkRegex = /href="\/(.*?)"/g;
const matter = require('gray-matter');
const path = require('path');
const fs = require('fs');

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

function generateDefaultUrl(inputPath) {
  // Remove the src/site/notes prefix and .md extension
  const relativePath = inputPath.replace(/^.*?\/notes\//, '').replace(/\.md$/, '');
  return `/notes/${relativePath}`;
}

function getGraph(data) {
  return new Promise((resolve) => {
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
      resolve({
        homeAlias: "/",
        nodes: {},
        links: []
      });
      return;
    }

    // Process each note in sequence
    for (let idx = 0; idx < noteCollection.length; idx++) {
      const note = noteCollection[idx];
      const inputPath = note.inputPath; // Define inputPath early for logging

      // Get content and frontmatter safely
      let content = '';
      let frontMatter = {};
      try {
        // Only access inputPath from the note object
        if (!inputPath) {
          console.error(`[getGraph] Error: Missing inputPath for note at index ${idx}`);
          continue; // Skip this note
        }
        if (!fs.existsSync(inputPath)) {
          console.error(`[getGraph] Error: File does not exist for note at index ${idx}: ${inputPath}`);
          continue; // Skip this note
        }

        const rawContent = fs.readFileSync(inputPath, 'utf8');
        
        const parsed = matter(rawContent);
        content = parsed.content;
        frontMatter = parsed.data;
      } catch (error) {
        console.error(`[getGraph] Error processing note at index ${idx} (path: ${inputPath}):`, error);
        throw error;
      }

      // Generate safe data without accessing any template properties
      const defaultUrl = generateDefaultUrl(note.inputPath);
      const fileSlug = path.basename(note.inputPath, '.md');
      
      const safeData = {
        url: frontMatter.permalink || defaultUrl,
        fileSlug,
        filePathStem: note.inputPath.replace(/\.md$/, ''),
        inputPath: note.inputPath,
        data: {
          title: frontMatter.title || fileSlug,
          tags: Array.isArray(frontMatter.tags) ? [...frontMatter.tags] : [],
          'dg-home': frontMatter['dg-home'] || false,
          'dg-graph-exclude': frontMatter['dg-graph-exclude'] || false,
          'dg-graph-title': frontMatter['dg-graph-title'] || '',
          noteIcon: frontMatter.noteIcon || process.env.NOTE_ICON_DEFAULT,
          hideInGraph: frontMatter.hide || false
        }
      };

      // Check if this is a home/garden entry
      if (safeData.data.tags.includes('gardenEntry')) {
        safeData.data['dg-home'] = true;
      }

      console.log(`Processing note: ${safeData.url}`, {
        title: safeData.data.title,
        fileSlug: safeData.fileSlug,
        graphExclude: safeData.data['dg-graph-exclude']
      });

      // Only exclude if dg-graph-exclude is explicitly true (boolean)
      if (safeData.data['dg-graph-exclude'] === true) { 
        console.log(`Excluding note: ${safeData.url} because dg-graph-exclude is true.`);
        excludedNodes.add(safeData.url);
        continue;
      }
      
      // Determine group based on file path
      let parts = note.inputPath.split(path.sep);
      let group = "none";
      const notesIndex = parts.indexOf('notes');
      if (notesIndex >= 0 && parts.length > notesIndex + 2) {
        group = parts[notesIndex + 1];
      }

      // Extract links from the content
      const outboundLinks = extractLinks(content || '');
      console.log(`Found ${outboundLinks.length} outbound links in ${safeData.url}`);

      nodes[safeData.url] = {
        id: idx,
        title: safeData.data['dg-graph-title'] || safeData.data.title,
        url: safeData.url,
        group,
        home: safeData.data['dg-home'],
        outBound: outboundLinks.filter(link => !excludedNodes.has(link)),
        neighbors: new Set(),
        backLinks: new Set(),
        noteIcon: safeData.data.noteIcon,
        hide: safeData.data.hideInGraph,
      };

      console.log(`Node created: ${safeData.url} with ID ${idx}`);
      stemURLs[fileSlug] = safeData.url;
      if (safeData.data['dg-home']) {
        homeAlias = safeData.url;
      }
    }

    // Process links after all nodes are created
    if (Object.keys(nodes).length === 0) {
      console.warn('No nodes were created for the graph.');
      resolve({
        homeAlias,
        nodes: {},
        links: []
      });
      return;
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
    resolve({
      homeAlias,
      nodes,
      links
    });
  });
}

exports.wikiLinkRegex = wikiLinkRegex;
exports.internalLinkRegex = internalLinkRegex;
exports.extractLinks = extractLinks;
exports.getGraph = getGraph;
