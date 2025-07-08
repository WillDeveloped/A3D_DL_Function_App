const { app } = require('@azure/functions');

app.http('Datalake', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route:'Testfunction.js',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
