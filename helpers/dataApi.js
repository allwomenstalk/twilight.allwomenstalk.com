require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.ATLAS_DATA_API_URL;
const API_KEY = process.env.ATLAS_DATA_API_KEY;

/**
 * Executes an aggregation pipeline on the specified collection.
 * @param {string} dataSource - The name of the data source (cluster).
 * @param {string} database - The name of the database.
 * @param {string} collection - The name of the collection.
 * @param {Array} pipeline - The aggregation pipeline.
 * @returns {Promise<Object>} - The result of the aggregation.
 */
const aggregate = async (dataSource, database, collection, pipeline) => {
  console.log('API URL:', API_URL)
  try {
    const response = await axios.post(`${API_URL}/action/aggregate`, {
      dataSource,
      database,
      collection,
      pipeline
    }, {
      headers: {
        'Content-Type': 'application/ejson',
        'Accept': 'application/json',
        'apiKey': API_KEY
      }
    });

    return response.data.documents;
  } catch (error) {
    console.error('Error executing aggregation:', error);
    throw error;
  }
};

module.exports = {
  aggregate
};
