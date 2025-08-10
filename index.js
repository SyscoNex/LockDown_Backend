// index.js
const express = require('express');
const app = express();
const PORT = 3000;
const connectDB = require('./database')
const cors = require('cors');

// Connect to MongoDB
connectDB();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true                 
}));


const userRoutes = require('./routes/user');
const studentRoutes = require('./routes/studentRoutes');
const examSession = require('./routes/examSessionRoutes')
const teacherRoutes = require('./routes/teacherRoutes')



app.use('/api', userRoutes);
app.use('/api/student', studentRoutes)
app.use('/api/examSession', examSession)
app.use('/api/teacher', teacherRoutes)

// Example route
app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});


app.get('/', (req, res) => {
  res.send('Hello from Node.js backend with MongoDB!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
