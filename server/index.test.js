const request = require('supertest');
const server = require('./index');

afterAll((done) => {
  server.close(done);
});

describe('GET /', () => {
  it('should return 200 OK', async () => {
    const res = await request(server).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Server is running');
  });
});
