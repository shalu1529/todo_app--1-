import React, { useEffect, useState } from 'react';
import API, { getVapidPublicKey, subscribeToPushNotifications } from './api';
import TaskForm from './components/TaskForm';
import { Pencil, Trash2 } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    const res = await API.get('/tasks');
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);



function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const subscribeToNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Register service worker if not already registered
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    // Get the VAPID public key from the server
    const publicKey = await getVapidPublicKey();
    
    const registration = await navigator.serviceWorker.ready;
    
    // Check if we already have a subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
    }

    // Create a new subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    // Send the subscription to the server
    await subscribeToPushNotifications(subscription);
    console.log('Successfully subscribed to push notifications');
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
  }
};



useEffect(() => {
  // Register service worker
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Force update the service worker
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
      
      // Register the service worker again
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(registration => {
          console.log('Service Worker registered successfully with scope:', registration.scope);
          
          // Check notification permission first
          if (Notification.permission === 'granted') {
            console.log('Notification permission already granted');
            subscribeToNotifications();
          } else if (Notification.permission !== 'denied') {
            // Request permission
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                console.log('Notification permission granted');
                subscribeToNotifications();
              } else {
                console.log('Notification permission denied');
              }
            });
          } else {
            console.log('Notification permission denied previously');
          }
        })
        .catch(error => console.error('Service Worker registration failed:', error));
    });
  }
}, []);


  const handleSave = async (data) => {
    if (selectedTask) {
      await API.put(`/tasks/${selectedTask.id}`, data);
      setSelectedTask(null);
    } else {
      await API.post('/tasks', data);
    }
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const handleComplete = async (id) => {
    await API.patch(`/tasks/${id}/complete`);
    fetchTasks();
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.due_date) < new Date() && !t.is_completed
  ).length;
  const highPriority = tasks.filter((t) => t.priority === 'High').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-blue-700 flex items-center gap-2">
            ✅ Task Manager
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Stay organized and get things done</p>
            
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Tasks" value={totalTasks} icon="📋" color="blue" />
          <StatCard title="Completed" value={completedTasks} icon="✅" color="green" />
          <StatCard title="Overdue" value={overdueTasks} icon="⚠️" color="red" />
          <StatCard title="High Priority" value={highPriority} icon="🎯" color="orange" />
        </div>

        {/* Task Form & List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">➕ Create / Edit Task</h2>
            <TaskForm onSave={handleSave} selectedTask={selectedTask} />
          </div>

          <div className="bg-white p-5 rounded-lg shadow overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📋 Task List</h2>
            <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
              <thead className="text-gray-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2">Task</th>
                  <th className="px-4 py-2">Due Date</th>
                  <th className="px-4 py-2">Priority</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="bg-gray-100 hover:bg-gray-200 transition rounded-lg"
                  >
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3 text-gray-500">{task.due_date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          task.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td
  className="px-4 py-3 cursor-pointer"
  onClick={() => handleComplete(task.id)}
>
  <span
    className={`text-xs font-semibold px-2 py-1 rounded-full ${
      task.is_completed
        ? 'bg-green-200 text-green-800'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    {task.is_completed ? 'Completed' : 'Pending'}
  </span>
</td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
    <div>
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
    </div>
    <div className="text-3xl">{icon}</div>
  </div>
);

export default App;
