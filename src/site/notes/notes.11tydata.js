require("dotenv").config();
const settings = require("../../helpers/constants");
const path = require('path');

const allSettings = settings.ALL_NOTE_SETTINGS;

module.exports = {
  eleventyComputed: {
    layout: (data) => {
      if (data.tags && data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags && data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }
      // If a permalink is explicitly set in the frontmatter, use it
      if (data.permalink) {
        return data.permalink;
      }
      
      // Generate a unique permalink based on the full file path
      const filePathParts = data.filePathStem.split('/notes/');
      if (filePathParts.length < 2) {
        // Fallback for files not in the expected structure
        return `/notes/${path.basename(data.filePathStem)}/`;
      }
      
      // Use the path after /notes/ to maintain directory structure
      return `/${filePathParts[1]}/`;
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
  },
};
