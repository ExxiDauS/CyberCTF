import express from 'express';
import dockerRouter from "./routes/docker";

// import { start } from './utils/generate-compose';

const app = express();

const PORT = 3000;

app.use("/docker", dockerRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 