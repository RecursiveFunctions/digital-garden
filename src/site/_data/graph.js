const linkUtils = require('../../helpers/linkUtils');

/**
 * Generates the graph data for the digital garden
 * 
 * @param {Object} data - The Eleventy data object
 * @returns {Object} - The graph data for the digital garden
 */
module.exports = async function(data) {
  try {
    console.log('Generating graph data for the digital garden...');
    
    // Wait for collections to be ready
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Validate input data
    if (!data || !data.collections) {
      console.error('Invalid data object. Missing collections property.');
      throw new Error('Invalid data object');
    }
    
    // Check if the note collection exists
    if (!data.collections.note) {
      console.warn('Note collection is missing or empty. Check your eleventy config.');
    }
    
    // Generate graph data synchronously to avoid template access issues
    const graphData = linkUtils.getGraph(data);
    
    // Validate the generated graph data
    const nodeCount = Object.keys(graphData.nodes || {}).length;
    const linkCount = (graphData.links || []).length;
    
    console.log(`Graph data generated successfully. Nodes: ${nodeCount}, Links: ${linkCount}`);
    
    // Return valid graph data or fallback to empty structure
    return {
      homeAlias: graphData.homeAlias || "/",
      nodes: graphData.nodes || {},
      links: graphData.links || []
    };
  } catch (error) {
    console.error('Error generating graph data:', error);
    
    // Create a simple fallback graph with a single home node
    // This ensures the graph component always has something to render
    return {
      homeAlias: "/",
      nodes: {
        "/": {
          id: 0,
          title: "Home",
          url: "/",
          group: "none",
          home: true,
          outBound: [],
          neighbors: [],
          backLinks: [],
          size: 0
        }
      },
      links: []
    };
  }
}; 