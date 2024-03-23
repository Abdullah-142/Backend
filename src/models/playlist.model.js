import { mongoose } from "mongoose"


const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  }]
},
  {
    timestamps: true
  })

export const Playlist = mongoose.model("Playlist", playlistSchema)