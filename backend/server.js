import express from 'express';  
import cors from 'cors';

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.get('/', (req, res) => {
  res.send({ fruits: ['apple', 'banana', 'cherry'] });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});