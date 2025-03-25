---
dg-publish: true
permalink: /daily-notes-index/
dg-path: "Daily Notes"
noteIcon: "calendar"
created: "2025-03-25"
---

# Daily Notes Archive

This page contains links to all daily notes, sorted by date (newest first). This index is automatically generated during site build.

{% for group in dailyNotesIndex.groups %}
## {{ group.name }}
{% for file in group.files %}
- [[{{ file.path }}|{{ file.displayDate }}]]{% if file.title %} - {{ file.title }}{% endif %}
{% endfor %}
{% endfor %}

<div class="note-footer">
  <div class="note-updated">Last updated: {{ "now" | date: "%d %b %Y" }}</div>
</div> 