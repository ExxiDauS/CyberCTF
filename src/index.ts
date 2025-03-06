// index.ts (Main Application File)
import express from 'express';
import userRouter from './routes/users';

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/users', userRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});