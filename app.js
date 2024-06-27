const express = require('express');
const app = express();
const employee = require('./src/routes/employeeRoutes');
const connectDB = require('./db/connect');
const Employee = require('./src/models/Employee');
require('dotenv').config();

app.use(express.json());

app.get('', (req, res) => {
    res.send('Task Manager');
});

//check routes employees
app.use('/api/employees', employee);

const port = 6789;


const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI);
      app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };
  
  start();