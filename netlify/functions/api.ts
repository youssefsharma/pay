import { Handler } from '@netlify/functions';

// In-memory storage simulation using global variable
// Note: This will reset on each function cold start
let clients = new Map();

const handler: Handler = async (event) => {
  const path = event.path.replace('/.netlify/functions/api/', '');
  const segments = path.split('/');
  const method = event.httpMethod;

  try {
    // GET /api/clients
    if (method === 'GET' && segments[0] === 'clients' && !segments[1]) {
      const clientsArray = Array.from(clients.entries()).map(([id, data]) => ({
        id,
        ...data
      }));
      return {
        statusCode: 200,
        body: JSON.stringify(clientsArray)
      };
    }

    // GET /api/clients/:clientId
    if (method === 'GET' && segments[0] === 'clients' && segments[1]) {
      const client = clients.get(segments[1]);
      if (!client) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Client not found' })
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(client)
      };
    }

    // POST /api/clients
    if (method === 'POST' && segments[0] === 'clients') {
      const { name, downloadLink } = JSON.parse(event.body || '{}');
      if (!name || !downloadLink) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Name and download link are required' })
        };
      }
      clients.set(name, { name, downloadLink });
      return {
        statusCode: 201,
        body: JSON.stringify({ name, downloadLink })
      };
    }

    // PUT /api/clients/:clientId
    if (method === 'PUT' && segments[0] === 'clients' && segments[1]) {
      const { name, downloadLink } = JSON.parse(event.body || '{}');
      if (!clients.has(segments[1])) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Client not found' })
        };
      }
      clients.set(segments[1], { name, downloadLink });
      return {
        statusCode: 200,
        body: JSON.stringify({ name, downloadLink })
      };
    }

    // DELETE /api/clients/:clientId
    if (method === 'DELETE' && segments[0] === 'clients' && segments[1]) {
      if (!clients.has(segments[1])) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Client not found' })
        };
      }
      clients.delete(segments[1]);
      return {
        statusCode: 204,
        body: ''
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };