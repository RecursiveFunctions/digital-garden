const slugify = require("@sindresorhus/slugify");
const markdownIt = require("markdown-it");
const fs = require("fs");
const matter = require("gray-matter");
const faviconsPlugin = require("eleventy-plugin-gen-favicons");
const tocPlugin = require("eleventy-plugin-nesting-toc");
const { parse } = require("node-html-parser");
const htmlMinifier = require("html-minifier-terser");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const path = require('path');

const { headerToId, namedHeadingsFilter } = require("./src/helpers/utils");
const {
  userMarkdownSetup,
  userEleventySetup,
} = require("./src/helpers/userSetup");

const Image = require("@11ty/eleventy-img");
const { sortNotes } = require("./src/helpers/collections");
const linkUtils = require('./src/helpers/linkUtils');

function transformImage(src, cls, alt, sizes, widths = ["500", "700", "auto"]) {
  let options = {
    widths: widths,
    formats: ["webp", "jpeg"],
    outputDir: "./dist/img/optimized",
    urlPath: "/img/optimized",
  };

  // generate images, while this is async we don't wait
  Image(src, options);
  let metadata = Image.statsSync(src, options);
  return metadata;
}

function getAnchorLink(filePath, linkTitle) {
  const {attributes, innerHTML} = getAnchorAttributes(filePath, linkTitle);
  return `<a ${Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(" ")}>${innerHTML}</a>`;
}

function getAnchorAttributes(filePath, linkTitle) {
  let fileName = filePath.replaceAll("&amp;", "&");
  let header = "";
  let headerLinkPath = "";
  
  // Handle permalinks in wiki-links
  if (filePath.startsWith('/') && filePath.endsWith('/')) {
    // This is a permalink-style link, extract without the slashes
    const permalinkPath = filePath.slice(1, -1);
    let noteIcon = process.env.NOTE_ICON_DEFAULT;
    const title = linkTitle ? linkTitle : permalinkPath;
    
    // Simply use the permalink directly
    return {
      attributes: {
        "class": "internal-link",
        "target": "",
        "data-note-icon": noteIcon,
        "href": `${filePath}`,
      },
      innerHTML: title,
    }
  }
  
  if (filePath.includes("#")) {
    [fileName, header] = filePath.split("#");
    headerLinkPath = `#${headerToId(header)}`;
  }

  let noteIcon = process.env.NOTE_ICON_DEFAULT;
  const title = linkTitle ? linkTitle : fileName;
  let permalink = `/notes/${slugify(fileName)}`;
  let deadLink = false;

  try {
    const startPath = "./src/site/notes/";
    let fullPath;
    
    // Make sure we don't duplicate the base path
    if (fileName.startsWith('src/site/notes/')) {
      fileName = fileName.replace('src/site/notes/', '');
    }
    
    // Check for exact file match in the root directory first
    const rootFilePath = `${startPath}${fileName}${fileName.endsWith('.md') ? '' : '.md'}`;
    if (fs.existsSync(rootFilePath)) {
      // Direct match in root directory
      fullPath = rootFilePath;
    } else if (fileName.includes('/')) {
      // If the path already contains a directory structure, treat it differently
      fullPath = fileName.endsWith(".md") 
        ? `${startPath}${fileName}` 
        : `${startPath}${fileName}.md`;
    } else {
      // For simple filenames, search recursively through directories
      const files = fs.readdirSync(startPath, { recursive: true });
      const matchingFile = files.find(file => 
        file.toLowerCase().endsWith(`${fileName.toLowerCase()}.md`) || 
        file.toLowerCase() === fileName.toLowerCase()
      );
      
      if (matchingFile) {
        fullPath = `${startPath}${matchingFile}`;
      } else {
        // Don't attempt to create stub files, just construct a best-guess path
        fullPath = fileName.endsWith(".md") 
          ? `${startPath}${fileName}` 
          : `${startPath}${fileName}.md`;
      }
    }
    
    // Only try to read the file if it exists
    if (fs.existsSync(fullPath)) {
      const file = fs.readFileSync(fullPath, "utf8");
      const frontMatter = matter(file);
      
      // Use permalink from frontmatter if available
      if (frontMatter.data.permalink) {
        permalink = frontMatter.data.permalink;
      } else if (frontMatter.data["dg-path"]) {
        // Use dg-path if available as a fallback
        permalink = `/${frontMatter.data["dg-path"].toLowerCase().replace(/\s+/g, "-")}/`;
      }
      
      if (frontMatter.data.tags && frontMatter.data.tags.indexOf("gardenEntry") != -1) {
        permalink = "/";
      }
      if (frontMatter.data.noteIcon) {
        noteIcon = frontMatter.data.noteIcon;
      }
    } else {
      console.warn(`File not found: ${fullPath}`);
      deadLink = true;
    }
  } catch (e) {
    console.warn(`Error resolving link for ${fileName}:`, e);
    deadLink = true;
  }

  if (deadLink) {
    return {
      attributes: {
        "class": "internal-link is-unresolved",
        "href": `/notes/${slugify(fileName)}`,
        "target": "",
      },
      innerHTML: title,
    }
  }
  return {
    attributes: {
      "class": "internal-link",
      "target": "",
      "data-note-icon": noteIcon,
      "href": `${permalink}${headerLinkPath}`,
    },
    innerHTML: title,
  }
}

const tagRegex = /(^|\s|\>)(#[^\s!@#$%^&*()=+\.,\[{\]};:'"?><]+)(?!([^<]*>))/g;

// Helper function to handle missing files by creating stubs
function getOrCreateNoteStub(filePath) {
  const startPath = "./src/site/notes/";
  const fullPath = filePath.endsWith(".md") 
    ? `${startPath}${filePath}` 
    : `${startPath}${filePath}.md`;
  
  try {
    // Check if file exists first
    fs.readFileSync(fullPath, "utf8");
    return fullPath; // Return the path if it exists
  } catch (e) {
    // File doesn't exist, just log a warning
    console.warn(`File not found: ${fullPath}`);
    return fullPath;
  }
}

module.exports = function (eleventyConfig) {
  eleventyConfig.setLiquidOptions({
    dynamicPartials: true,
  });
  let markdownLib = markdownIt({
    breaks: true,
    html: true,
    linkify: true,
  })
    .use(require("markdown-it-anchor"), {
      slugify: headerToId,
    })
    .use(require("markdown-it-mark"))
    .use(require("markdown-it-footnote"))
    .use(function (md) {
      md.renderer.rules.hashtag_open = function (tokens, idx) {
        return '<a class="tag" onclick="toggleTagSearch(this)">';
      };
    })
    .use(require("markdown-it-mathjax3"), {
      tex: {
        inlineMath: [["$", "$"]],
      },
      options: {
        skipHtmlTags: { "[-]": ["pre"] },
      },
    })
    .use(require("markdown-it-attrs"))
    .use(require("markdown-it-task-checkbox"), {
      disabled: true,
      divWrap: false,
      divClass: "checkbox",
      idPrefix: "cbx_",
      ulClass: "task-list",
      liClass: "task-list-item",
    })
    .use(require("markdown-it-plantuml"), {
      openMarker: "```plantuml",
      closeMarker: "```",
    })
    .use(namedHeadingsFilter)
    .use(function (md) {
      //https://github.com/DCsunset/markdown-it-mermaid-plugin
      const origFenceRule =
        md.renderer.rules.fence ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        if (token.info === "mermaid") {
          const code = token.content.trim();
          return `<pre class="mermaid">${code}</pre>`;
        }
        if (token.info === "transclusion") {
          const code = token.content.trim();
          return `<div class="transclusion">${md.render(code)}</div>`;
        }
        if (token.info.startsWith("ad-")) {
          const code = token.content.trim();
          const parts = code.split("\n")
          let titleLine;
          let collapse;
          let collapsible = false
          let collapsed = true
          let icon;
          let color;
          let nbLinesToSkip = 0
          for (let i = 0; i < 4; i++) {
            if (parts[i] && parts[i].trim()) {
              let line = parts[i] && parts[i].trim().toLowerCase()
              if (line.startsWith("title:")) {
                titleLine = line.substring(6);
                nbLinesToSkip++;
              } else if (line.startsWith("icon:")) {
                icon = line.substring(5);
                nbLinesToSkip++;
              } else if (line.startsWith("collapse:")) {
                collapsible = true
                collapse = line.substring(9);
                if (collapse && collapse.trim().toLowerCase() == 'open') {
                  collapsed = false
                }
                nbLinesToSkip++;
              } else if (line.startsWith("color:")) {
                color = line.substring(6);
                nbLinesToSkip++;
              }
            }
          }
          const foldDiv = collapsible ? `<div class="callout-fold">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-chevron-down">
              <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          </div>` : "";
          const titleDiv = titleLine
            ? `<div class="callout-title"><div class="callout-title-inner">${titleLine}</div>${foldDiv}</div>`
            : "";
          let collapseClasses = titleLine && collapsible ? 'is-collapsible' : ''
          if (collapsible && collapsed) {
            collapseClasses += " is-collapsed"
          }

          let res = `<div data-callout-metadata class="callout ${collapseClasses}" data-callout="${token.info.substring(3)
            }">${titleDiv}\n<div class="callout-content">${md.render(
              parts.slice(nbLinesToSkip).join("\n")
            )}</div></div>`;
          return res
        }

        // Other languages
        return origFenceRule(tokens, idx, options, env, slf);
      };

      const defaultImageRule =
        md.renderer.rules.image ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const imageName = tokens[idx].content;
        //"image.png|metadata?|width"
        const [fileName, ...widthAndMetaData] = imageName.split("|");
        const lastValue = widthAndMetaData[widthAndMetaData.length - 1];
        const lastValueIsNumber = !isNaN(lastValue);
        const width = lastValueIsNumber ? lastValue : null;

        let metaData = "";
        if (widthAndMetaData.length > 1) {
          metaData = widthAndMetaData.slice(0, widthAndMetaData.length - 1).join(" ");
        }

        if (!lastValueIsNumber) {
          metaData += ` ${lastValue}`;
        }

        if (width) {
          const widthIndex = tokens[idx].attrIndex("width");
          const widthAttr = `${width}px`;
          if (widthIndex < 0) {
            tokens[idx].attrPush(["width", widthAttr]);
          } else {
            tokens[idx].attrs[widthIndex][1] = widthAttr;
          }
        }

        return defaultImageRule(tokens, idx, options, env, self);
      };

      const defaultLinkRule =
        md.renderer.rules.link_open ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options, env, self);
        };
      md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        const aIndex = tokens[idx].attrIndex("target");
        const classIndex = tokens[idx].attrIndex("class");
        const href = tokens[idx].attrGet("href");
        const isInternalLink = href && (href.startsWith("/") || href.startsWith("#"));

        if (aIndex < 0 && !isInternalLink) {
          tokens[idx].attrPush(["target", "_blank"]);
        } else if (aIndex >= 0 && !isInternalLink) {
          tokens[idx].attrs[aIndex][1] = "_blank";
        }

        if (classIndex < 0 && !isInternalLink) {
          tokens[idx].attrPush(["class", "external-link"]);
        } else if (classIndex >= 0 && !isInternalLink) {
          tokens[idx].attrs[classIndex][1] = "external-link";
        }

        return defaultLinkRule(tokens, idx, options, env, self);
      };
    })
    .use(userMarkdownSetup);

  eleventyConfig.setLibrary("md", markdownLib);

  eleventyConfig.addFilter("isoDate", function (date) {
    return date && date.toISOString();
  });

  // Add a transclusion filter (not transform) that runs before the link filter
  eleventyConfig.addFilter("transclusion", function (str) {
    return (
      str &&
      str.replace(/!\[\[(.*?)\]\]/g, (match, filename) => {
        // Attempt to find the file to transclude
        const filePath = findFile(filename);
        
        if (filePath) {
          // If file found, generate transclusion HTML
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Parse the frontmatter and content
          const parsed = matter(fileContent);
          
          // Render only the content part (excluding frontmatter)
          return `<div class="transclusion">${markdownLib.render(parsed.content)}</div>`;
        } else {
          // If file not found, show an error message
          return `<div class="transclusion-error">Transclusion error: File "${filename}" not found.</div>`;
        }
      })
    );
  });

  eleventyConfig.addFilter("link", function (str) {
    return (
      str &&
      str.replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, function (match, fileLink, linkTitle) {
        // Skip transclusion links since they are now handled by the transclusion filter
        if (fileLink.startsWith("![[")) {
          return match; // Return unchanged, already processed by transclusion filter
        }
        
        // Check if it is an embedded excalidraw drawing or mathjax javascript
        if (fileLink.indexOf("],[") > -1 || fileLink.indexOf('"$"') > -1) {
          return match;
        }
        
        // If it's an image link, convert it to markdown image format
        if (fileLink.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
          const imagePath = `/img/user/raw_notes/Images/${fileLink}`;
          return `![${fileLink}](${imagePath})`;
        }
        
        // If the link already has a path structure, try to use it directly
        if (fileLink.includes('/')) {
          return getAnchorLink(fileLink, linkTitle || fileLink);
        }
        
        // Try to find the file by alias or by searching through the file structure
        const startPath = "./src/site/notes/";
        let foundFilePath = null;
        
        try {
          // First, check for exact file match in root directory
          const rootFilePath = fileLink.endsWith('.md') 
            ? `${startPath}${fileLink}` 
            : `${startPath}${fileLink}.md`;
            
          if (fs.existsSync(rootFilePath)) {
            // Direct match in root directory, keep file name as is
            foundFilePath = fileLink;
          } else {
            // If not found in root, search recursively
            const files = fs.readdirSync(startPath, { recursive: true });
            
            // Try to find a direct match by filename
            const exactMatch = files.find(file => {
              if (!file.includes('/')) return false; // Skip root files (already checked)
              return file.toLowerCase() === `${fileLink.toLowerCase()}.md` || 
                    file.toLowerCase() === fileLink.toLowerCase();
            });
            
            if (exactMatch) {
              foundFilePath = exactMatch.replace(/\.md$/, '');
            } else {
              // Try to find by alias if no exact match
              for (const file of files) {
                if (!file.endsWith('.md')) continue;
                try {
                  const content = fs.readFileSync(`${startPath}${file}`, 'utf8');
                  const frontMatter = matter(content);
                  if (frontMatter.data.aliases && Array.isArray(frontMatter.data.aliases) && 
                      frontMatter.data.aliases.some(alias => alias === fileLink)) {
                    foundFilePath = file.replace(/\.md$/, '');
                    break;
                  }
                } catch (e) {
                  console.warn(`Error reading file ${file} while searching for alias:`, e);
                }
              }
            }
          }
        } catch (e) {
          console.warn(`Error during file search:`, e);
        }
        
        // Use the found path or fall back to the original fileLink
        return getAnchorLink(foundFilePath || fileLink, linkTitle || fileLink);
      })
    );
  });

  eleventyConfig.addFilter("taggify", function (str) {
    return (
      str &&
      str.replace(tagRegex, function (match, precede, tag) {
        return `${precede}<a class="tag" onclick="toggleTagSearch(this)" data-content="${tag}">${tag}</a>`;
      })
    );
  });

  eleventyConfig.addFilter("searchableTags", function (str) {
    let tags;
    let match = str && str.match(tagRegex);
    if (match) {
      tags = match
        .map((m) => {
          return `"${m.split("#")[1]}"`;
        })
        .join(", ");
    }
    if (tags) {
      return `${tags},`;
    } else {
      return "";
    }
  });

  eleventyConfig.addFilter("hideDataview", function (str) {
    return (
      str &&
      str.replace(/\(\S+\:\:(.*)\)/g, function (_, value) {
        return value.trim();
      })
    );
  });

  eleventyConfig.addTransform("dataview-js-links", function (str) {
    const parsed = parse(str);
    for (const dataViewJsLink of parsed.querySelectorAll("a[data-href].internal-link")) {
      const notePath = dataViewJsLink.getAttribute("data-href");
      const title = dataViewJsLink.innerHTML;
      const {attributes, innerHTML} = getAnchorAttributes(notePath, title);
      for (const key in attributes) {
        dataViewJsLink.setAttribute(key, attributes[key]);
      }
      dataViewJsLink.innerHTML = innerHTML;
    }

    return str && parsed.innerHTML;
  });

  eleventyConfig.addTransform("callout-block", function (str) {
    const parsed = parse(str);

    const transformCalloutBlocks = (
      blockquotes = parsed.querySelectorAll("blockquote")
    ) => {
      for (const blockquote of blockquotes) {
        transformCalloutBlocks(blockquote.querySelectorAll("blockquote"));

        let content = blockquote.innerHTML;

        let titleDiv = "";
        let calloutType = "";
        let calloutMetaData = "";
        let isCollapsable;
        let isCollapsed;
        const calloutMeta = /\[!([\w-]*)\|?(\s?.*)\](\+|\-){0,1}(\s?.*)/;
        if (!content.match(calloutMeta)) {
          continue;
        }

        content = content.replace(
          calloutMeta,
          function (metaInfoMatch, callout, metaData, collapse, title) {
            isCollapsable = Boolean(collapse);
            isCollapsed = collapse === "-";
            const titleText = title.replace(/(<\/{0,1}\w+>)/, "")
              ? title
              : `${callout.charAt(0).toUpperCase()}${callout
                .substring(1)
                .toLowerCase()}`;
            const fold = isCollapsable
              ? `<div class="callout-fold"><i icon-name="chevron-down"></i></div>`
              : ``;

            calloutType = callout;
            calloutMetaData = metaData;
            titleDiv = `<div class="callout-title"><div class="callout-title-inner">${titleText}</div>${fold}</div>`;
            return "";
          }
        );

        /* Hacky fix for callouts with only a title:
        This will ensure callout-content isn't produced if
        the callout only has a title, like this:
        ```md
        > [!info] i only have a title
        ```
        Not sure why content has a random <p> tag in it,
        */
        if (content === "\n<p>\n") {
          content = "";
        }
        let contentDiv = content ? `\n<div class="callout-content">${content}</div>` : "";

        blockquote.tagName = "div";
        blockquote.classList.add("callout");
        blockquote.classList.add(isCollapsable ? "is-collapsible" : "");
        blockquote.classList.add(isCollapsed ? "is-collapsed" : "");
        blockquote.setAttribute("data-callout", calloutType.toLowerCase());
        calloutMetaData && blockquote.setAttribute("data-callout-metadata", calloutMetaData);
        blockquote.innerHTML = `${titleDiv}${contentDiv}`;
      }
    };

    transformCalloutBlocks();

    return str && parsed.innerHTML;
  });

  function fillPictureSourceSets(src, cls, alt, meta, width, imageTag) {
    imageTag.tagName = "picture";
    let html = `<source
      media="(max-width:480px)"
      srcset="${meta.webp[0].url}"
      type="image/webp"
      />
      <source
      media="(max-width:480px)"
      srcset="${meta.jpeg[0].url}"
      />
      `
    if (meta.webp && meta.webp[1] && meta.webp[1].url) {
      html += `<source
        media="(max-width:1920px)"
        srcset="${meta.webp[1].url}"
        type="image/webp"
        />`
    }
    if (meta.jpeg && meta.jpeg[1] && meta.jpeg[1].url) {
      html += `<source
        media="(max-width:1920px)"
        srcset="${meta.jpeg[1].url}"
        />`
    }
    html += `<img
      class="${cls.toString()}"
      src="${src}"
      alt="${alt}"
      width="${width}"
      />`;
    imageTag.innerHTML = html;
  }

  eleventyConfig.addTransform("picture", function (str) {
    if(process.env.USE_FULL_RESOLUTION_IMAGES === "true"){
      return str;
    }
    const parsed = parse(str);
    for (const imageTag of parsed.querySelectorAll(".cm-s-obsidian img")) {
      const src = imageTag.getAttribute("src");
      if (src && src.startsWith("/") && !src.endsWith(".svg")) {
        const cls = imageTag.classList.value;
        const alt = imageTag.getAttribute("alt");
        const width = imageTag.getAttribute("width") || '';

        try {
          const meta = transformImage(
            "./src/site" + decodeURI(imageTag.getAttribute("src")),
            cls.toString(),
            alt,
            ["(max-width: 480px)", "(max-width: 1024px)"]
          );

          if (meta) {
            fillPictureSourceSets(src, cls, alt, meta, width, imageTag);
          }
        } catch {
          // Make it fault tolarent.
        }
      }
    }
    return str && parsed.innerHTML;
  });

  eleventyConfig.addTransform("table", function (str) {
    const parsed = parse(str);
    for (const t of parsed.querySelectorAll(".cm-s-obsidian > table")) {
      let inner = t.innerHTML;
      t.tagName = "div";
      t.classList.add("table-wrapper");
      t.innerHTML = `<table>${inner}</table>`;
    }

    for (const t of parsed.querySelectorAll(
      ".cm-s-obsidian > .block-language-dataview > table"
    )) {
      t.classList.add("dataview");
      t.classList.add("table-view-table");
      t.querySelector("thead")?.classList.add("table-view-thead");
      t.querySelector("tbody")?.classList.add("table-view-tbody");
      t.querySelectorAll("thead > tr")?.forEach((tr) => {
        tr.classList.add("table-view-tr-header");
      });
      t.querySelectorAll("thead > tr > th")?.forEach((th) => {
        th.classList.add("table-view-th");
      });
    }
    return str && parsed.innerHTML;
  });

  eleventyConfig.addTransform("htmlMinifier", (content, outputPath) => {
    if (
      (process.env.NODE_ENV === "production" || process.env.ELEVENTY_ENV === "prod") &&
      outputPath &&
      outputPath.endsWith(".html")
    ) {
      return htmlMinifier.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        preserveLineBreaks: true,
        minifyCSS: true,
        minifyJS: true,
        keepClosingSlash: true,
      });
    }
    return content;
  });

  eleventyConfig.addPassthroughCopy("src/site/img");
  eleventyConfig.addPassthroughCopy("src/site/scripts");
  eleventyConfig.addPassthroughCopy("src/site/styles/_theme.*.css");
  // Temporarily comment out favicon plugin
  // eleventyConfig.addPlugin(faviconsPlugin, { outputDir: "dist" });
  eleventyConfig.addPlugin(tocPlugin, {
    ul: true,
    tags: ["h1", "h2", "h3", "h4", "h5", "h6"],
  });

  eleventyConfig.addFilter("dateToZulu", function (date) {
    try {
      return new Date(date).toISOString("dd-MM-yyyyTHH:mm:ssZ");
    } catch {
      return "";
    }
  });
  
  eleventyConfig.addFilter("jsonify", function (variable) {
    return JSON.stringify(variable) || '""';
  });

  eleventyConfig.addFilter("validJson", function (variable) {
    if (Array.isArray(variable)) {
      return variable.map((x) => x.replaceAll("\\", "\\\\")).join(",");
    } else if (typeof variable === "string") {
      return variable.replaceAll("\\", "\\\\");
    }
    return variable;
  });

  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: "slash",
      singleTags: ["link"],
    },
  });

  // Add combined collection for notes and graph data
  eleventyConfig.addCollection("notesAndGraph", async function(collectionApi) {
    console.log("[notesAndGraph Collection] Starting computation...");
    const notes = sortNotes(collectionApi); // Get the sorted notes first
    console.log(`[notesAndGraph Collection] Got ${notes.length} notes from sortNotes.`);

    // Now, generate graph data using the computed notes collection
    // Construct a 'data'-like object for getGraph
    // Ensure collections structure matches what getGraph expects
    const graphInputData = { collections: { note: notes } }; 
    let graphData;
    try {
        console.log("[notesAndGraph Collection] Calling linkUtils.getGraph...");
        graphData = await linkUtils.getGraph(graphInputData);
        const nodeCount = Object.keys(graphData.nodes || {}).length;
        const linkCount = (graphData.links || []).length;
        console.log(`[notesAndGraph Collection] Graph data generated successfully. Nodes: ${nodeCount}, Links: ${linkCount}`);
        // Log the generated node URLs for inspection
        if (graphData.nodes) {
            const generatedUrls = Object.values(graphData.nodes).map(n => n.url);
            console.log("[notesAndGraph Collection] Generated Node URLs:", JSON.stringify(generatedUrls.slice(0, 20), null, 2)); // Log first 20
            if (generatedUrls.length > 20) console.log("[notesAndGraph Collection] (... more URLs truncated)");
        }
    } catch (error) {
        console.error('[notesAndGraph Collection] Error generating graph data:', error);
        // Return fallback graph data if generation fails
        graphData = {
          homeAlias: "/",
          nodes: { "/": { id: 0, title: "Home", url: "/", group: "none", home: true, outBound: [], neighbors: [], backLinks: [], size: 0 } },
          links: []
        };
    }

    // Return both the notes and the graph data
    console.log("[notesAndGraph Collection] Computation finished.");
    return {
        notes: notes,
        graph: graphData
    };
  });

  // Add global data for daily notes index
  eleventyConfig.addGlobalData("dailyNotesIndex", () => {
    try {
      return require("./src/site/_data/dailyNotesIndex.js")();
    } catch (error) {
      console.error("Error generating daily notes index:", error);
      return { groups: [] };
    }
  });

  userEleventySetup(eleventyConfig);

  eleventyConfig.addTransform("obsidian-image-embeds", function (str) {
    // Handle ![[image.png]] format which is common in Obsidian
    return str.replace(/!\[\[([^[\]]*\.(?:png|jpg|jpeg|gif|svg|webp))\]\]/gi, function (match, imageName) {
      const imagePath = `/img/user/raw_notes/Images/${imageName}`;
      return `![${imageName}](${imagePath})`;
    });
  });
  
  // Place this right before the module.exports
  function customImageTransform(content) {
    const parsed = parse(content);
    if(process.env.USE_FULL_RESOLUTION_IMAGES === "true"){
      //This section handles markdown image with the format ![alt](src|width|class)
      for (const imageTag of parsed.querySelectorAll(".cm-s-obsidian img")) {
        const src = imageTag.getAttribute("src");
        if (!src || !src.startsWith("/")) continue;
        const cls = imageTag.classList.value;
        const alt = imageTag.getAttribute("alt");
        const width = imageTag.getAttribute("width") || '';
        try {
          const meta = transformImage(
          "./src/site" + decodeURI(imageTag.getAttribute("src")),
          cls,
          alt,
          width
          );
          fillPictureSourceSets(src, cls, alt, meta, width, imageTag);
        } catch (e) {
          console.log("Image transform error:", e);
        }
      }
    }

    // Apply additional callout and image transforms
    transformCalloutBlocks(parsed.querySelectorAll("blockquote"));

    return parsed.innerHTML;
  }

  function findFile(filename) {
    // Possible file extensions to look for
    const extensions = ['md', 'markdown', 'html'];
    
    // Possible directories to search in
    const directories = [
      path.join(__dirname, 'src', 'site', 'notes'),
      path.join(__dirname, 'src', 'site', 'posts'),
    ];
    
    // Search for the file in each directory and with each extension
    for (const dir of directories) {
      for (const ext of extensions) {
        const filePath = path.join(dir, `${filename}.${ext}`);
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }
    
    // If file not found, return null
    return null;
  }

  return {
    dir: {
      input: "src/site",
      output: "dist",
      data: `_data`,
    },
    templateFormats: ["njk", "md", "11ty.js"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false,
    passthroughFileCopy: true,
  };
};
