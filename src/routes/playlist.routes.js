import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

playlistRouter.use(verifyJWT)

playlistRouter.route("/create").post(createPlaylist)
playlistRouter.route("/u/:userId").get(getUserPlaylists)
playlistRouter.route("/p/:playlistId").get(getPlaylistById)
playlistRouter.route("/v/:videoId/p/:playlistId").patch(addVideoToPlaylist)
playlistRouter.route("/r/:videoId/p/:playlistId").patch(removeVideoFromPlaylist)
playlistRouter.route("/d/:playlistId").delete(deletePlaylist)
playlistRouter.route("/update-playlist/:playlistId").patch(updatePlaylist)
export { playlistRouter };
