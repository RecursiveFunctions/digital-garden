---
{"dg-publish":true,"dg-path":"Frontmatter.md","permalink":"/frontmatter/","noteIcon":"","created":"2025-03-14T00:35:47.494-07:00","updated":"2025-03-14T02:00:53.456-07:00"}
---

Frontmatter is metadata you add to the top of your notes in Obsidian, enclosed between triple dashes (---)

## Digital Garden Plugin frontmatter
###  Basic Properties

```yaml
---
dg-publish: true          # Controls whether the note is published
title: "Custom Title"    # Sets the page title
dg-permalink: "custom"   # Custom URL path
dg-path: "Folder/Note.md" # Output file path
---
```

###  Display Control

```yaml
---
dg-pinned: true          # Pins the note
dg-pinned-order: 1       # Controls order of pinned notes
dg-hide: true            # Hides from navigation
dg-hide-in-graph: true   # Hides from graph view
dg-content-classes: "cards" # Adds custom CSS classes
dg-show-backlinks: true # shows pages linking to this page
dg-show-file-tree: true # shows the file tree on the side
dg-enable-search: true # enables the search bar on this page
dg-show-local-graph: true #shows local graph on desktop (not on mobile)
dg-show-home-link: true # determines whether to show a link to homepage
dg-show-toc: true # shows table of contents for page
---
```

###  Meta Tags

```yaml
---
dg-metatags:
    description: "Page description"
    "og:image": "https://example.com/image.png"
    "og:title": "Custom social title"
    keywords: "comma, separated, keywords"
---
```


These properties are documented in the official Digital Garden documentation at [dg-docs.ole.dev/03 Note settings/](https://dg-docs.ole.dev/03%20Note%20settings/) 