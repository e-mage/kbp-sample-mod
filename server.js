const http = require('http');
const redis = require('redis');

const client = redis.createClient({
    // 'host': 'redis' // !!! for master redis (write) we must create separate client with 'host' : 'redis-0.redis-write'
    // Должен еще где-то быть указан пароль к redis, который можно прочитать из файла /etc/redis-passwd
    username: 'default', // use your Redis user.
    password: readFileSync('/etc/redis-passwd'), // use your password here
    socket: {
        host: 'redis',
        port: 6379
    }
});

const clientWrite = redis.createClient({
    // 'host': 'redis' // !!! for master redis (write) we must create separate client with 'host' : 'redis-0.redis-write'
    // Должен еще где-то быть указан пароль к redis, который можно прочитать из файла /etc/redis-passwd
    username: 'default', // use your Redis user.
    password: readFileSync('/etc/redis-passwd'), // use your password here
    socket: {
        host: 'redis-0.redis-write',
        port: 6379
    }
});

const port = 8080;

const requestHandler = (request, response) => {
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
    client.get(key, (err, value) => {
        if (err) {
            response.writeHead(500);
            response.end(err.toString());
            return;
        }
        var journals = [];
        if (value) {
            journals = JSON.parse(value);
            journalsToShow = journals.slice(0, process.env.JOURNAL_ENTRIES); // First JOURNAL_ENTRIES elements
        }
        if (request.method == 'GET') {
            response.writeHead(200);
            response.end(JSON.stringify(journalsToShow));
        }
        if (request.method == 'POST') {
            try {
                let body = [];
                request.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    const msg = JSON.parse(body);
                    journals.push(msg);
                    clientWrite.set(key, JSON.stringify(journals));
                    response.writeHead(200);
                    response.end(JSON.stringify(journals));
                });
            } catch (err) {
                response.writeHeader(500);
                response.end(err.toString());
                return;
            }
        }
    });
    return;
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('could not start server', err);
  }

  console.log('api server up and running.');
})