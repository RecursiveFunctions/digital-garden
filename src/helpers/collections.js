const fs = require('fs');
const path = require('path');

function getDateFromNote(note) {
  // First try to get date from frontmatter
  if (note.data.created) {
    return new Date(note.data.created);
  }

  // Then try to get date from filename (YYYY-MM-DD format)
  const dateFromFilename = new Date(note.fileSlug);
  if (!isNaN(dateFromFilename)) {
    return dateFromFilename;
  }

  // If all else fails, return file date
  return note.date;
}

function sortNotes(collection) {
  return collection.getFilteredByTag("note").sort((a, b) => {
    // Only sort if both notes are in the Daily Notes directory
    const isADailyNote = a.filePathStem.includes('/Daily Notes/');
    const isBDailyNote = b.filePathStem.includes('/Daily Notes/');

    if (isADailyNote && isBDailyNote) {
      // Sort by filename (which contains the date) in reverse order
      return b.fileSlug.localeCompare(a.fileSlug);
    }

    // For all other notes, maintain their original order
    return 0;
  });
}

module.exports = {
  sortNotes
}; 