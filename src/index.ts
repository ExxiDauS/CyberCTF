// index.ts
import express from 'express';
import userRouter from './routes/users';
import authRouter from './routes/auth'; // Import the auth routes
import courseRouter from './routes/courses';
import rolesRouter from './routes/roles';
import problemRouter from './routes/problems';
import cors from 'cors';
import dockerRouter from "./routes/docker";

// import { start } from './utils/generate-compose';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true,
  }));
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter); // Use the auth routes
app.use('/api/courses', courseRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/problems', problemRouter); 

app.use("/docker", dockerRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the API!');res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});