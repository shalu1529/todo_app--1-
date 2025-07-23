//utils/notificationHelper.js

const pool = require('../db');
const webpush = require('web-push');
require('dotenv').config();

// VAPID keys for Web Push



webpush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Save client subscription to database
const saveSubscription = async (subscription) => {
  try {
    await pool.query(
      'INSERT INTO subscriptions (endpoint, subscription) VALUES ($1, $2)',
      [subscription.endpoint, JSON.stringify(subscription)]
    );
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
};

// Format overdue notifications
const formatGroupedNotifications = async () => {
  const today = new Date();
  const res = await pool.query(
    `SELECT * FROM tasks WHERE is_completed = false AND due_date < CURRENT_DATE`
  );

  if (res.rows.length === 0) {
    return "No overdue tasks";
  }

  const grouped = { High: 0, Medium: 0, Low: 0 };
  res.rows.forEach((task) => {
    grouped[task.priority]++;
  });

  // Format the message with total count first
  let message = `You have ${res.rows.length} overdue task${res.rows.length > 1 ? 's' : ''}:\n`;
  
  // Add priority counts
  Object.entries(grouped).forEach(([priority, count]) => {
    if (count > 0) {
      if (count === 1) {
        message += `${count} ${priority} Priority task\n`;
      } else {
        message += `${count} ${priority} Priority tasks\n`;
      }
    }
  });

  // Add up to 3 specific task names
  if (res.rows.length > 0) {
    message += '\nTasks include:\n';
    const taskSample = res.rows.slice(0, 3);
    taskSample.forEach(task => {
      message += `• ${task.title} (${task.priority})\n`;
    });
    
    if (res.rows.length > 3) {
      message += `• ...and ${res.rows.length - 3} more`;
    }
  }

  return message.trim();
};

// Send Push Notification
// const sendPushNotifications = async () => {
//   if (subscriptions.length === 0) return;

//   const message = await formatGroupedNotifications();
//   if (!message.includes('overdue')) return;

//   subscriptions.forEach((sub) => {
//     webpush.sendNotification(sub, message).catch(console.error);
//   });
// };


const sendPushNotifications = async () => {
  // Get all subscriptions from database
  const subscriptionsResult = await pool.query('SELECT * FROM subscriptions');
  const subscriptions = subscriptionsResult.rows;
  
  if (subscriptions.length === 0) return;

  const messageText = await formatGroupedNotifications();
  if (!messageText.includes('overdue')) return;

  // Format the notification as JSON
  const notificationPayload = JSON.stringify({
    title: 'Todo App - Overdue Tasks',
    body: messageText
  });

  console.log('Sending notifications with payload:', notificationPayload);

  for (const sub of subscriptions) {
    try {
      // Use the subscription directly if it's already an object, or parse it if it's a string
      let parsedSubscription;
      if (typeof sub.subscription === 'string') {
        parsedSubscription = JSON.parse(sub.subscription);
      } else {
        parsedSubscription = sub.subscription;
      }
      
      console.log('Sending notification to:', sub.endpoint);
      await webpush.sendNotification(parsedSubscription, notificationPayload);
      console.log('Notification sent successfully');
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.warn('Removing expired subscription:', sub.endpoint);
        // Remove expired subscription from database
        await pool.query('DELETE FROM subscriptions WHERE endpoint = $1', [sub.endpoint]);
      } else {
        console.error('Push notification error:', err);
      }
    }
  }
};





module.exports = {
  saveSubscription,
  sendPushNotifications
};



