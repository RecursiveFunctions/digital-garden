---
{"dg-publish":true,"permalink":"/src/site/notes/installing-obsidian-on-kali-linux/","noteIcon":"","created":"2025-03-20T01:32:27.995-04:00","updated":"2025-03-20T01:32:46.291-04:00"}
---

##### Download the [AppImage](https://github.com/obsidianmd/obsidian-releases/releases/download/v1.0.3/Obsidian-1.0.3.AppImage) [(Archived)](https://web.archive.org/web/20250314/https://github.com/obsidianmd/obsidian-releases/releases/download/v1.0.3/Obsidian-1.0.3.AppImage)  for Obsidian


```bash
#modify the permissions
sudo chmod u+x Obsidian-1.0.3.AppImage
```

##### run Obsidian
optional: add "`&`" at the end to run it in the background and free up your terminal
```bash
./Obsidian-1.0.3.AppImage &
```