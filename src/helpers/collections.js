const fs = require('fs');
const path = require('path');

function sortNotes(collection) {
  return collection.getFilteredByTag("note").sort((a, b) => {
    // Only sort if both notes are in the Daily Notes directory
    const isADailyNote = a.filePathStem.includes('Daily Notes/');
    const isBDailyNote = b.filePathStem.includes('Daily Notes/');

    if (isADailyNote && isBDailyNote) {
      // Extract the date from the fileSlug (YYYY-MM-DD format)
      const dateA = a.fileSlug.split('/').pop();
      const dateB = b.fileSlug.split('/').pop();
      
      // Sort by date in reverse order (newest first)
      return dateB.localeCompare(dateA);
    }

    // For all other notes, maintain their original order
    return 0;
  });
}

module.exports = {
  sortNotes
}; 