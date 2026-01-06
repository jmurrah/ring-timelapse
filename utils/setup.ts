import { RingApi } from "ring-client-api";
import dotenv from "dotenv";
import { subscribeToRingToken } from "./tokenRefresh.js";
import { error } from "node:console";

export async function setup() {
  dotenv.config();
  const ringRefreshToken = process.env.RING_REFRESH_TOKEN;

  if (ringRefreshToken === undefined) {
    throw error("Undefined ring token.");
  }

  const ringApi = new RingApi({
    refreshToken: ringRefreshToken,
  });

  await subscribeToRingToken(ringApi);
}
