var conn = new Mongo();
var db = conn.getDB('performance_manager');

db.users.drop();
db.users.insertMany([
  {
    userName: 'admin',
    password: '123',
    firstName: 'jay',
    lastName: 'p',
    sex: 'M',
    role: 'admin'
  }
]);
