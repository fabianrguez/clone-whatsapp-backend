import { model, Schema } from 'mongoose';

const whatsappSchema = new Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

export default model('messageContent', whatsappSchema);
