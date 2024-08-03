const db = require('../db/connection');
const inquirer = require('inquirer');

// View all departments
async function viewAllDepartments() {
  const [rows] = await db.query('SELECT id, name FROM department');
  console.table(rows);
}

// View all roles
async function viewAllRoles() {
  const [rows] = await db.query(`
    SELECT r.id, r.title, d.name AS department, r.salary 
    FROM role r
    JOIN department d ON r.department_id = d.id
  `);
  console.table(rows);
}

// View all employees
async function viewAllEmployees() {
  const [rows] = await db.query(`
    SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      r.title, 
      d.name AS department, 
      r.salary, 
      CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `);
  console.table(rows);
}

// Add a department
async function addDepartment() {
  const department = await inquirer.prompt([
    {
      name: 'name',
      message: 'What is the name of the department?'
    }
  ]);

  await db.query('INSERT INTO department SET ?', department);
  console.log(`Added ${department.name} to the database`);
}

// Add a role
async function addRole() {
  const [departments] = await db.query('SELECT id, name FROM department');

  const role = await inquirer.prompt([
    {
      name: 'title',
      message: 'What is the name of the role?'
    },
    {
      name: 'salary',
      message: 'What is the salary of the role?'
    },
    {
      type: 'list',
      name: 'department_id',
      message: 'Which department does the role belong to?',
      choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
    }
  ]);

  await db.query('INSERT INTO role SET ?', role);
  console.log(`Added ${role.title} to the database`);
}

// Add an employee
async function addEmployee() {
  const [roles] = await db.query('SELECT id, title FROM role');
  const [employees] = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');

  const employee = await inquirer.prompt([
    {
      name: 'first_name',
      message: "What is the employee's first name?"
    },
    {
      name: 'last_name',
      message: "What is the employee's last name?"
    },
    {
      type: 'list',
      name: 'role_id',
      message: "What is the employee's role?",
      choices: roles.map(role => ({ name: role.title, value: role.id }))
    },
    {
      type: 'list',
      name: 'manager_id',
      message: "Who is the employee's manager?",
      choices: [
        { name: 'None', value: null },
        ...employees.map(emp => ({ name: emp.name, value: emp.id }))
      ]
    }
  ]);

  await db.query('INSERT INTO employee SET ?', employee);
  console.log(`Added ${employee.first_name} ${employee.last_name} to the database`);
}

// Update an employee role
async function updateEmployeeRole() {
  const [employees] = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
  const [roles] = await db.query('SELECT id, title FROM role');

  const { employeeId, roleId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employeeId',
      message: 'Which employee\'s role do you want to update?',
      choices: employees.map(emp => ({ name: emp.name, value: emp.id }))
    },
    {
      type: 'list',
      name: 'roleId',
      message: 'Which role do you want to assign the selected employee?',
      choices: roles.map(role => ({ name: role.title, value: role.id }))
    }
  ]);

  await db.query('UPDATE employee SET role_id = ? WHERE id = ?', [roleId, employeeId]);
  console.log(`Updated employee's role`);
}

module.exports = {
  viewAllDepartments,
  viewAllRoles,
  viewAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole
};