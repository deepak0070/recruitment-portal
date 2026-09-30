const mysql = require('../config/db.mysql');
const mockDb = require('./mockDb');

// Set custom query handler to route all queries directly to mockDb
mysql.setQueryHandler((sql, params) => {
  return mockDb.execute(sql, params);
});

jest.spyOn(mysql, 'testConnection').mockResolvedValue(true);

beforeAll(() => {
  mockDb.reset();
});
