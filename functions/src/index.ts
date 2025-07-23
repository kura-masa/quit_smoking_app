import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {TwitterApi} from "twitter-api-v2";
import {format} from "date-fns";
import {subDays} from "date-fns";

admin.initializeApp();

const db = admin.firestore();

// Japan timezone
const JAPAN_TIMEZONE = "Asia/Tokyo";

// Twitter API configuration
const getTwitterClient = (accessToken: string, accessTokenSecret: string) => {
  const config = functions.config();
  const twitterConfig = config.twitter || {};

  return new TwitterApi({
    appKey: twitterConfig.api_key || "dummy_key",
    appSecret: twitterConfig.api_secret || "dummy_secret",
    accessToken,
    accessSecret: accessTokenSecret,
  });
};

// Send daily reminder tweets at 8 AM JST
export const sendDailyReminder = functions
  .pubsub
  .schedule("0 8 * * *")
  .timeZone(JAPAN_TIMEZONE)
  .onRun(async () => {
    console.log("Daily reminder function started");

    try {
    // Get active challenges
      const challengesSnapshot = await db
        .collection("challenges")
        .where("status", "==", "active")
        .get();

      const promises = challengesSnapshot.docs.map(async (challengeDoc) => {
        const challenge = challengeDoc.data();
        const challengeId = challengeDoc.id;

        try {
        // Get user information
          const userDoc = await db.collection("users")
            .doc(challenge.userId).get();
          if (!userDoc.exists) {
            console.error(`User not found: ${challenge.userId}`);
            return;
          }

          const user = userDoc.data();
          if (!user) return;

          // Create Twitter API client
          const twitterClient = getTwitterClient(
            user.accessToken,
            user.accessTokenSecret
          );

          // Calculate current day
          const startDate = challenge.startDate.toDate();
          const today = new Date();
          const timeDiff = today.getTime() - startDate.getTime();
          const currentDay = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

          // Skip if over 30 days
          if (currentDay > 30) {
            return;
          }

          // Success report page URL
          const todayString = format(today, "yyyy-MM-dd");
          const config = functions.config();
          const baseUrl = (config.app && config.app.url) || "https://quit-smoking-5f964.web.app";
          const reportUrl = `${baseUrl}/report-success?userId=${
            challenge.userId}&challengeId=${challengeId}&date=${todayString}`;

          // Tweet content
          const tweetText = `Quit Smoking Challenge Day ${currentDay}!\n\n` +
          "Did you continue to quit smoking today?\n" +
          `Report your success here:\n\n${reportUrl}\n\n` +
          "#QuitSmokingChallenge #HealthyLife";

          // Post tweet
          await twitterClient.v2.tweet(tweetText);

          // Update challenge current day
          await db.collection("challenges").doc(challengeId).update({
            currentDay: currentDay,
          });

          console.log(`Daily reminder sent for user ${
            challenge.userId}, day ${currentDay}`);
        } catch (error) {
          console.error(`Error sending reminder for challenge ${
            challengeId}:`, error);
        }
      });

      await Promise.all(promises);
      console.log("Daily reminder function completed");
    } catch (error) {
      console.error("Error in daily reminder function:", error);
    }
  });

// Check failures and execute penalty at 4 AM JST
export const checkFailuresAndExecutePenalty = functions
  .pubsub
  .schedule("0 4 * * *")
  .timeZone(JAPAN_TIMEZONE)
  .onRun(async () => {
    console.log("Failure check function started");

    try {
    // Get active challenges
      const challengesSnapshot = await db
        .collection("challenges")
        .where("status", "==", "active")
        .get();

      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

      const promises = challengesSnapshot.docs.map(async (challengeDoc) => {
        const challenge = challengeDoc.data();
        const challengeId = challengeDoc.id;

        try {
        // Check if there was a success report yesterday
          const successLogDoc = await db
            .collection("successLogs")
            .doc(`${challengeId}_${yesterday}`)
            .get();

          // If no success report, execute failure process
          if (!successLogDoc.exists) {
          // Get user information
            const userDoc = await db.collection("users")
              .doc(challenge.userId).get();
            if (!userDoc.exists) {
              console.error(`User not found: ${challenge.userId}`);
              return;
            }

            const user = userDoc.data();
            if (!user) return;

            // Create Twitter API client
            const twitterClient = getTwitterClient(
              user.accessToken,
              user.accessTokenSecret
            );

            // Post failure tweet
            const failureTweet = `I, "${challenge.realName}", am an ` +
            "embarrassing person who failed the 30-day quit smoking " +
            "challenge. #QuitSmokingChallengeFailed";
            await twitterClient.v2.tweet(failureTweet);

            // Update challenge status to failed
            await db.collection("challenges").doc(challengeId).update({
              status: "failed",
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`Penalty executed for user ${challenge.userId}`);
          } else {
          // If there was a success report, check for 30-day completion
            const startDate = challenge.startDate.toDate();
            const today = new Date();
            const timeDiff = today.getTime() - startDate.getTime();
            const currentDay = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

            if (currentDay >= 30) {
            // Get user information for success tweet
              const userDoc = await db.collection("users")
                .doc(challenge.userId).get();
              if (!userDoc.exists) {
                console.error(`User not found: ${challenge.userId}`);
                return;
              }

              const user = userDoc.data();
              if (!user) return;

              // 30 days achieved!
              await db.collection("challenges").doc(challengeId).update({
                status: "completed",
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
              });

              // Post success tweet
              const successTwitterClient = getTwitterClient(
                user.accessToken,
                user.accessTokenSecret
              );
              const successTweet = "Congratulations! I have completely " +
              "conquered the 30-day quit smoking challenge!\n\n" +
              "I was able to be reborn as a new person!\n\n" +
              "#QuitSmokingChallengeSuccess #HealthyLife #30DaysComplete";
              await successTwitterClient.v2.tweet(successTweet);

              console.log(`Challenge completed for user ${challenge.userId}`);
            }
          }
        } catch (error) {
          console.error(`Error checking failure for challenge ${
            challengeId}:`, error);
        }
      });

      await Promise.all(promises);
      console.log("Failure check function completed");
    } catch (error) {
      console.error("Error in failure check function:", error);
    }
  });

