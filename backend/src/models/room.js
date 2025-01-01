import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
<<<<<<< HEAD
    unique: true
  },
  gameChoice: {
    type: String,
    required: true
  },
  fiesteros: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    avatar: String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Auto deleted after 24 hours
  }
=======
    unique: true,
  },
  gameChoice: {
    type: String,
    required: true,
  },
  fiesteros: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      username: String,
      avatar: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto deleted after 24 hours
  },
>>>>>>> pemc-helpme
});

const Room = mongoose.model("Room", roomSchema);

<<<<<<< HEAD
export default Room;
=======
export default Room;
>>>>>>> pemc-helpme
