function sortNotes(collection) {
  return collection.getFilteredByTag("note").sort((a, b) => {
    // Sort by title alphabetically
    return a.data.title.localeCompare(b.data.title);
  });
}

module.exports = {
  sortNotes
}; 