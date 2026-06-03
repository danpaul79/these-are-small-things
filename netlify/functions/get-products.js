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
        // Base URL for the Airtable table
        const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

        // Debug logging
        console.log('Airtable request:', {
            baseId: AIRTABLE_BASE_ID,
            tableName: AIRTABLE_TABLE_NAME,
            url: baseUrl
        });

        // Airtable returns at most 100 records per request and includes an `offset`
        // token when more pages exist. Loop until there's no offset so the FULL catalog
        // is returned — otherwise the site silently caps at the first 100 products.
        let allRecords = [];
        let offset;
        let page = 0;
        const MAX_PAGES = 50; // safety stop (~5,000 records) to avoid an infinite loop

        do {
            const url = new URL(baseUrl);
            url.searchParams.set('pageSize', '100');
            if (offset) {
                url.searchParams.set('offset', offset);
            }

            const response = await fetch(url.toString(), {
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
            allRecords = allRecords.concat(data.records || []);
            offset = data.offset;
            page++;
        } while (offset && page < MAX_PAGES);

        if (offset) {
            // Hit the safety cap with more pages still available — log it rather than fail silently.
            console.warn(`Stopped paginating after ${MAX_PAGES} pages; some records may be omitted.`);
        }

        // Debug logging
        console.log('Airtable response:', {
            recordCount: allRecords.length,
            pages: page
        });

        // Return successful response (same shape the frontend expects: { records: [...] })
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
            },
            body: JSON.stringify({ records: allRecords })
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
