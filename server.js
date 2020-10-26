import express from 'express';
import mongoose from 'mongoose';
import Message from './schemas/Message';
import Messages from './schemas/Message';

const PORT = process.env.PORT || 9000;
const app = express();

const connection_uri =
  'mongodb+srv://admin:3IwghccwpDKo1g3s@cluster0.sgsvm.mongodb.net/whatsappdb?retryWrites=true&w=majority';

mongoose.connect(connection_uri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.post('/messages/new', (req, res) => {
  Messages.create(req.body, (err, data) =>
    err ? res.status(500).send(err) : res.status(201).send(data)
  );
});

app.get('/messages/sync', (req, res) => {
  Messages.find((err, data) =>
    err ? res.status(500).send(err) : res.status(200).send(data)
  );
});

app.listen(PORT, () =>
  console.log(`Server listening in http://localhost:${PORT}`)
);
