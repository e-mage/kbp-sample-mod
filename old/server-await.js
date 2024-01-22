import * as http from 'http';
import * as redis from 'redis';
import { readFileSync } from 'fs';

// Read and Write RedisClients
const client = await redis.createClient({
    // 'host': 'redis'
    // Read password from file /etc/redis-passwd/passwd
    url: `redis://:${readFileSync('/etc/redis-passwd/passwd')}@redis:6379`
})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

const clientWrite = await createClient({
    // For master redis (write) we must create separate client with 'host' : 'redis-0.redis'
    // Read password from file /etc/redis-passwd/passwd
    url: `redis://:${readFileSync('/etc/redis-passwd/passwd')}@redis-0.redis:6379`
})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

// Request Handler for HTTP Server
const requestHandler = async (request, response) => {
    console.log(request.url);
    if (!request.url.startsWith('/api')) {
        response.writeHead(404);
        response.end('Not found');
        return;
    }
    if (request.method != 'GET' && request.method != 'POST') {
        response.writeHead(400);
        response.end('Unsupported method.');
        return;
    }
    const key = 'journal-key';
    const value = await client.get(key);
    const journals = value ? JSON.parse(value) : [];
    const journalsToShow = journals.slice(0, process.env.JOURNAL_ENTRIES); // First JOURNAL_ENTRIES elements
    if (request.method == 'GET') {
        response.writeHead(200);
        response.end(JSON.stringify(journalsToShow));
    }
    if (request.method == 'POST') {
        try {
            let body = [];
            request.on('data', async (chunk) => {
                body.push(chunk);
            }).on('end', async () => {
                body = Buffer.concat(body).toString();
                const msg = JSON.parse(body);
                journals.push(msg);
                await clientWrite.set(key, JSON.stringify(journals));
                response.writeHead(200);
                response.end(JSON.stringify(journals));
            });
        } catch (err) {
            response.writeHeader(500);
            response.end(err.toString());
            return;
        }
    }
    return;
}

// Create HTTP server
const port = 8080;

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('could not start server', err);
  }

  console.log('api server up and running.');
})