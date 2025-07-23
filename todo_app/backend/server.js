const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const webpush = require('web-push');
const { sendPushNotifications, saveSubscription } = require('./utils/notificationHelper');
const taskRoutes = require('./routes/taskRoutes');
require('dotenv').config();

// Set VAPID details for web push
webpush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Push notification routes
app.post('/api/subscribe', async (req, res) => {
  try {
    const subscription = req.body;
    console.log('Received subscription:', subscription);
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription data is invalid' });
    }
    
    const result = await saveSubscription(subscription);
    if (result) {
      // Send a test notification immediately
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: 'Subscription Successful',
            body: 'You have successfully subscribed to notifications!'
          })
        );
        console.log('Test notification sent successfully');
      } catch (notifyError) {
        console.error('Failed to send test notification:', notifyError);
      }
      
      return res.status(201).json({ message: 'Subscription saved successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to save subscription' });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Daily check at 9:00 AM (for testing, run every minute)
cron.schedule('* * * * *', sendPushNotifications);

// Test notification endpoint
app.post('/api/test-notification', async (req, res) => {
  try {
    const subscriptionsResult = await pool.query('SELECT * FROM subscriptions');
    const subscriptions = subscriptionsResult.rows;
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ error: 'No subscriptions found' });
    }
    
    const testMessage = JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test notification from Todo App. If you can see this, notifications are working!'
    });
    
    console.log('Sending test notification to all subscribers');
    
    for (const sub of subscriptions) {
      try {
        let parsedSubscription;
        if (typeof sub.subscription === 'string') {
          parsedSubscription = JSON.parse(sub.subscription);
        } else {
          parsedSubscription = sub.subscription;
        }
        
        await webpush.sendNotification(parsedSubscription, testMessage);
        console.log('Test notification sent successfully to:', sub.endpoint);
      } catch (err) {
        console.error('Error sending test notification:', err);
      }
    }
    
    res.status(200).json({ message: 'Test notification sent' });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('To-Do App API running...');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
