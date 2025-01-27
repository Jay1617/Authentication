import cron from "node-cron";
import { User } from "../models/user.model.js";

export const removeUnverifiedUser = () =>{
  console.log("Cron job called!");
  
  cron.schedule("*/30 * * * *", async () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await User.deleteMany({
      accountVerified: false,
      createdAt: { $lt: thirtyMinutesAgo },
    });
  });
};