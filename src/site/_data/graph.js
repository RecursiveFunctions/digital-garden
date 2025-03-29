const linkUtils = require('../../helpers/linkUtils');

/**
 * Generates the graph data for the digital garden
 * 
 * @param {Object} data - The Eleventy data object
 * @returns {Object} - The graph data for the digital garden
 */
module.exports = function(data) {
  try {
    console.log('Generating graph data for the digital garden...');
    // Call the getGraph function from linkUtils
    const graphData = linkUtils.getGraph(data);
    console.log(`Graph data generated successfully. Nodes: ${Object.keys(graphData.nodes).length}, Links: ${graphData.links.length}`);
    return graphData;
  } catch (error) {
    console.error('Error generating graph data:', error);
    // Return a minimal valid graph structure to prevent runtime errors
    return {
      homeAlias: "/",
      nodes: {},
      links: []
    };
  }
}; 