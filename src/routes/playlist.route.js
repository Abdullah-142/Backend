import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist, getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
} from "../controllers/playlist.controller.js";

const playlistRouter = Router();

playlistRouter.use(verifyJWT)

playlistRouter.route("/create").post(createPlaylist)
playlistRouter.route("/user-playlists").get(getUserPlaylists)
playlistRouter.route("/p/:playlistId").get(getPlaylistById)
playlistRouter.route("/add-video/:playlistId").post(addVideoToPlaylist)
playlistRouter.route("/remove-video/:playlistId").patch(removeVideoFromPlaylist)
playlistRouter.route("/delete-playlist/:playlistId").delete(deletePlaylist)
playlistRouter.route("/update-playlist/:playlistId").patch(updatePlaylist)
export { playlistRouter };