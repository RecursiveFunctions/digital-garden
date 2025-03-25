---
dg-publish: true
permalink: /daily-notes/{{date:YYYY-MM-DD}}/
dg-path: "Daily Notes/{{date:YYYY-MM-DD}}"
noteIcon: ""
created: "{{date:YYYY-MM-DD}}"
---

<div class="daily-notes-sidebar">
  <h3>Daily Notes</h3>
  <div class="daily-notes-list">
    ```dataview
    LIST WITHOUT ID link(file.path, dateformat(file.cday, "dd-MMM-yyyy"))
    FROM "src/site/notes/Daily Notes"
    WHERE file.path != this.file.path
    SORT file.cday DESC
    ```
  </div>
</div>

# Notes for {{date:DD MMM YYYY}} 