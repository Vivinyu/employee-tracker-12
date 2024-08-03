const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'employee_tracker'
});

module.exports = connection.promise();