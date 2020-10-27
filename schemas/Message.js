import { Schema, model } from 'mongoose';

const whatsappSchema = new Schema({
  message: String,
  name: String,
  timestamp: String,
  room: String,
});

export default model('messagecontents', whatsappSchema);
