import cron from "node-cron";
import { User } from "../models/user.model.js";

export const removeUnverifiedUser = () =>
  cron.schedule(
    "0 0 * * *",
    async () => {
      const thirtyMinTime = new Date(Date.now() - 30 * 60 * 1000);
      await User.deleteMany({
        accountVerified: false,
        createdOn: { $lt: thirtyMinTime },
      });
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
