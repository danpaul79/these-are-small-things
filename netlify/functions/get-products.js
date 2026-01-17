/**
 * Netlify Serverless Function
 * Proxies requests to Airtable API to keep API key secure
 */

// Use native fetch in Netlify (available in Node 18+)
// If this fails, the function will return an error and frontend will use JSON fallback

exports.handler = async (event, context) => {
    // Set function timeout context
    context.callbackWaitsForEmptyEventLoop = false;
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Products';

    // Validate environment variables
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        console.error('Missing Airtable credentials');
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Server configuration error',
                message: 'Airtable credentials not configured'
            })
        };
    }

    try {
        // Fetch data from Airtable
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

        const response = await fetch(airtableUrl, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Airtable API error:', response.status, errorText);

            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: 'Failed to fetch from Airtable',
                    status: response.status
                })
            };
        }

        const data = await response.json();

        // Return successful response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Serverless function error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
