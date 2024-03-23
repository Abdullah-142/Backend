import { Router } from "express";


const likeRouter = Router();

likeRouter.use(verifyJWT);

export { likeRouter };