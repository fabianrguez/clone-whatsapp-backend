import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import Messages from './schemas/Message';
import cors from 'cors';
import { uniqWith, isEqual, findLastIndex } from 'lodash';

const PORT = process.env.PORT || 9000;
const app = express();

const connection_uri =
  'mongodb+srv://admin:3IwghccwpDKo1g3s@cluster0.sgsvm.mongodb.net/whatsappdb?retryWrites=true&w=majority';

const pusher = new Pusher({
  appId: '1097958',
  key: '40fc861f058dbd4ed4b7',
  secret: '408b918da54d32baf053',
  cluster: 'eu',
  useTLS: true,
});

mongoose.connect(connection_uri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('DB connected');

  const msgCollection = db.collection('messagecontents');
  const changeStream = msgCollection.watch();

  changeStream.on('change', (change) => {
    if (change.operationType === 'insert') {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted', {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
        room: messageDetails.room,
      });
      pusher.trigger('rooms', 'inserted', {
        room: messageDetails.room,
        lastMessage: messageDetails.message,
      });
    } else {
      console.log('error triggering Pusher');
    }
  });
});

app.use(express.json());
app.use(cors());

app.post('/messages/new', (req, res) => {
  Messages.create(req.body, (err, data) =>
    err ? res.status(500).send(err) : res.status(201).send(data)
  );
});

app.get(`/messages/:room/sync`, (req, res) => {
  const { room } = req.params;
  Messages.find({ room }, (err, data) =>
    err ? res.status(500).send(err) : res.status(200).send(data)
  );
});

app.get('/rooms', (req, res) => {
  Messages.find((err, data) => {
    const rooms = uniqWith(
      data.map((item) => item.room),
      isEqual
    );
    const roomsInfo = rooms.map((room) => {
      const index = findLastIndex(data, (item) => item.room === room);
      return {
        room,
        lastMessage: data[index].message,
      };
    });
    err ? res.status(500).send(err) : res.status(200).send(roomsInfo);
  });
});

app.listen(PORT, () =>
  console.log(`Server listening in http://localhost:${PORT}`)
);
