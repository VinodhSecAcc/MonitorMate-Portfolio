const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: true, // Allow all origins, or specify your domain
});

// Initialize Firebase Admin
admin.initializeApp();

// Helper function to safely serialize objects with circular references
function safeStringify(obj, indent = 2) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, val) => {
    if (val != null && typeof val === "object") {
      if (seen.has(val)) {
        return "[Circular Reference]";
      }
      seen.add(val);
    }
    return val;
  }, indent);
}

// Cloud Function to send warning notifications - CONVERTED TO HTTP FUNCTION
exports.sendWarningNotification = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Handle preflight OPTIONS request
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.status(204).send("");
        return;
      }

      // Only allow POST requests
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed. Use POST." });
        return;
      }

      console.log("=== FIREBASE FUNCTION DEBUG START ===");
      console.log("1. Raw request body:", safeStringify(req.body));
      console.log("2. Request method:", req.method);
      console.log("3. Request headers:", safeStringify(req.headers));

      // Extract data from request body
      const data = req.body;
      const {
        userId,
        username,
        universityId,
        courseCode,
        section,
        sessionType,
        timeSlot,
        date,
      } = data;

      console.log("4. Extracted fields:");
      console.log("   - userId:", userId, typeof userId);
      console.log("   - username:", username, typeof username);
      console.log("   - universityId:", universityId, typeof universityId);

      // Validate required fields
      if (!userId || !username) {
        console.error("5. VALIDATION FAILED - Missing required fields:");
        console.error("   - userId present:", !!userId);
        console.error("   - username present:", !!username);
        console.error("   - Full data object:", safeStringify(data));
        
        res.status(400).json({
          error: "Missing required fields: userId or username"
        });
        return;
      }

      console.log("6. Validation passed, proceeding with notification...");

      // Get all FCM tokens for this user (since they're stored per device)
      const tokensSnapshot = await admin
        .database()
        .ref(`users/students/${userId}/fcm_tokens`)
        .once("value");

      if (!tokensSnapshot.exists()) {
        console.error("7. No FCM tokens found for user:", userId);
        res.status(404).json({
          error: "FCM tokens not found for this user"
        });
        return;
      }

      const tokensData = tokensSnapshot.val();
      const fcmTokens = [];

      // Extract all tokens from different devices
      Object.keys(tokensData).forEach(deviceId => {
        const tokenData = tokensData[deviceId];
        if (tokenData && tokenData.token) {
          fcmTokens.push(tokenData.token);
        }
      });

      if (fcmTokens.length === 0) {
        res.status(404).json({
          error: "No valid FCM tokens found for this user"
        });
        return;
      }

      console.log(`8. Found ${fcmTokens.length} FCM tokens for user:`, userId);

      // Prepare the notification message
      const notificationPayload = {
        notification: {
          title: "⚠️ Academic Monitoring Alert",
          body: `Warning: Please focus on your ${sessionType.toLowerCase()} ` +
            `session for ${courseCode}`,
        },
        data: {
          type: "warning",
          userId: String(userId),
          username: String(username),
          universityId: String(universityId || ""),
          courseCode: String(courseCode || ""),
          section: String(section || ""),
          sessionType: String(sessionType || ""),
          timeSlot: String(timeSlot || ""),
          date: String(date || ""),
          timestamp: Date.now().toString(),
        },
        android: {
          notification: {
            color: "#FF6B35",
            sound: "default",
            priority: "high",
            channelId: "warning_channel",
          },
          priority: "high",
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              sound: "default",
              badge: 1,
              alert: {
                title: "⚠️ Academic Monitoring Alert",
                body: `Warning: Please focus on your ${sessionType.toLowerCase()} session for ${courseCode}`,
              },
              "content-available": 1,
            },
          },
        },
      };

      // Send notification to all user's devices
      const sendPromises = fcmTokens.map(async (token) => {
        try {
          const message = {
            ...notificationPayload,
            token: token,
          };
          
          const response = await admin.messaging().send(message);
          console.log("9. Notification sent successfully to token:", token.substring(0, 20) + "...");
          return { success: true, messageId: response, token };
        } catch (error) {
          console.error("10. Failed to send to token:", token.substring(0, 20) + "...", error.message);
          
          // Remove invalid tokens
          if (error.code === "messaging/registration-token-not-registered" || 
              error.code === "messaging/invalid-registration-token") {
            console.log("11. Removing invalid token from database");
            // You might want to remove this token from the database
          }
          
          return { success: false, error: error.message, token };
        }
      });

      const results = await Promise.all(sendPromises);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      console.log(`12. Notification results: ${successCount} successful, ${failureCount} failed`);

      // Store notification in Realtime Database
      // Get current time in Malaysia timezone (UTC+8)
      const currentTime = new Date();
      const malaysiaTime = new Date(currentTime.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for Malaysia timezone
      
      let hours = malaysiaTime.getHours();
      const minutes = malaysiaTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      
      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      
      // Add leading zeros
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
      
      // Format date as DD-MM-YYYY
      const day = malaysiaTime.getDate().toString().padStart(2, "0");
      const month = (malaysiaTime.getMonth() + 1).toString().padStart(2, "0"); // getMonth() returns 0-11
      const year = malaysiaTime.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      const notificationToStore = {
        title: "⚠️ Academic Monitoring Alert",
        body: {
          username: username || "N/A",
          universityId: universityId || "N/A",
          section: section || "N/A",
          courseCode: courseCode || "N/A",
          sessionType: sessionType || "N/A",
          timeSlot: timeSlot || "N/A",
          date: date || "N/A"
        },
        timeSent: formattedTime,
        dateSent: formattedDate,
        isNotificationViewed: false
      };

      // Save notification to user's notification folder
      await admin.database().ref(`users/students/${userId}/notification`).push(notificationToStore);
      console.log("12.5. Notification stored in database successfully");

      // Log the warning in database for record keeping
      const warningData = {
        userId: String(userId),
        username: String(username),
        universityId: String(universityId || ""),
        courseCode: String(courseCode || ""),
        section: String(section || ""),
        sessionType: String(sessionType || ""),
        timeSlot: String(timeSlot || ""),
        date: String(date || ""),
        sentAt: admin.database.ServerValue.TIMESTAMP,
        reason: "Unauthorized app usage detected",
        sentBy: "system",
        notificationResults: {
          totalTokens: fcmTokens.length,
          successCount,
          failureCount,
        },
      };

      await admin.database().ref(`warnings/${userId}`).push(warningData);

      if (successCount === 0) {
        res.status(500).json({
          error: "Failed to send notification to any device"
        });
        return;
      }

      console.log("13. Function completed successfully");
      console.log("=== FIREBASE FUNCTION DEBUG END ===");

      // Send success response
      res.status(200).json({
        success: true,
        message: `Warning notification sent successfully to ${successCount}/${fcmTokens.length} devices`,
        results: {
          totalTokens: fcmTokens.length,
          successCount,
          failureCount,
        },
      });

    } catch (error) {
      console.error("=== FIREBASE FUNCTION ERROR ===");
      
      // FIXED: Safe error logging to avoid circular reference issues
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error name:", error.name);
      
      // Only log the stack trace if it's available and safe
      if (error.stack) {
        console.error("Error stack:", error.stack);
      }
      
      // Log error details safely
      if (error.details) {
        console.error("Error details:", safeStringify(error.details));
      }
      
      console.error("=== END FIREBASE FUNCTION ERROR ===");

      // Send error response
      res.status(500).json({
        error: `Failed to send notification: ${error.message}`
      });
    }
  });
});