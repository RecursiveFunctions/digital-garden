---
dg-publish: true
permalink: /about/
pinned: true
dgShowFileTree: false
dgFilterDailyNotes: true
tags:
  - gardenEntry
---


This is basically my 2nd brain. Collecting my thoughts and notes and structuring it in a way that's easy to share to the world. 

This site is created using [[Obsidian\|Obsidian]] , the [Digital Garden Plugin](https://dg-docs.ole.dev/), and deployed with [vercel](https://vercel.com/). 

**Latest Update**

{%- set dailyNotes = collections.notes | filterBy("filePathStem", "includes", "Daily Notes/") -%}
{%- if dailyNotes.length > 0 -%}
{%- set latestNote = dailyNotes | first -%}
{%- set noteSlug = latestNote.fileSlug | split("/") | last -%}
{%- set displayDate = noteSlug | replace("2025-", "") | replace("2024-", "") | replace("2023-", "") | replace("-", " ") -%}
<a href="{{latestNote.url}}" class="internal-link">{{displayDate}}</a>
{%- endif -%}

>[!Question] If you're interested in what I'm doing **[[Now\|now]]**

>[!code] Programming Languages
>[[Bash\|Bash]] - Work environment and scripting shell
>[[Java|Java]] - Object-oriented programming language
>[[Powershell\|Powershell]] -  task-based command-line shell and scripting language built on .NET
>[[R\|R]] - Statistical Programming language
>

>[!os] Operating Systems
> [[Linux\|Linux]]
> [[Windows\|Windows]]

>[!note] Philosophy
> [[Philosophy/Personal Views|Personal Views]]

