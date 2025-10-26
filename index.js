// index.js
const express = require('express');
const app = express();
const PORT = 3000;
const connectDB = require('./database')
const cors = require('cors');
const path = require('path');

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true                 
}));


// serve /uploads as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  fallthrough: true,
  
}));



const userRoutes = require('./routes/user');
const studentRoutes = require('./routes/studentRoutes');
const examSession = require('./routes/examSessionRoutes')
const teacherRoutes = require('./routes/teacherRoutes')
const face = require('./routes/facepose')
const pasteRoutes = require('./routes/pasteRoutes')



app.use('/api', userRoutes);
app.use('/api/student', studentRoutes)
app.use('/api/examSession', examSession)
app.use('/api/teacher', teacherRoutes)
app.use('/api/face', face)
app.use('/api/paste', pasteRoutes)

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
