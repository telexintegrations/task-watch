# TASK WATCH

## Description
Task Watch is a project management tool implemented as a **Modifier Integration** for Telex. It enables teams within Telex channels to create, delegate, manage, and set deadlines for tasks efficiently.

## Features
- Create and assign tasks using a preset delimiter.
- View all created tasks.
- Delete tasks when no longer needed.
- Mark tasks as complete upon completion.
- Receive notifications in the channel when a task is due but not marked as complete.

## App Usage on Telex
### Setting Up the App
To begin using Task Watch on Telex, follow these steps:

1. **Log in to [Telex](https://telex.im/)** (or sign up if you don’t have an account) and select the organization where you want to install the integration.
2. Navigate to the **[Apps](https://telex.im/dashboard/applications)** tab and click **Add New**.
3. Copy and paste the following URL into the popup modal that appears:
   ```
   https://task-watch-production.up.railway.app/integration.json
   ```
4. Click **Save**, and once the application appears in the list of installed apps, click **Manage App**.
5. In the **Description** tab, click **Connect App** to start using Task Watch.
6. Go to the **Settings** tab, where you can configure:
   - **Task Creation Keyword:** This is the keyword that the app recognizes as a task creation trigger. The default keyword is `TODO:` (including the colon).
   - **Channel ID:** Specify the channel ID of the channel where the app should operate.
   - **Output:** In the output tab, under configured channels, select the custom channels button and then uncheck every other channel except the channel where you want the app to work.

### Integration Usage in Channel
After the successful setup, head to the channel whose ID was added in the settings to use the app.
To get the full application documentation with examples, send this message:
```
/tasks-info
```

To get a list of operation commands, send this message in the channel:
```
/tasks-man
```

Follow the instructions in these two commands to begin using Task Watch.

## App Usage Locally
To use Task Watch locally:

1. Clone this repo using:
   ```
   git clone git@github.com:telexintegrations/task-watch.git
   ```
2. `cd` into the newly created directory `task-watch` and run: 
   ```
   npm install
   ```
3. Make the bash script `test_script.sh` in the root directory of the project executable by running:
   ```
   chmod +x ./test_script.sh
   ```
4. Run the app in development mode with:
   ```
   npm run start:dev
   ```
5. Run the bash script like so:
   ```
   ./test_script.sh '<YOUR_CHANNEL_ID>' 'EXAMPLE MESSAGE HERE'
   ```

**NB:** You need to retrieve your channel ID from Telex.

## Hosting the Integration Yourself
To host the integration yourself:

1. Fork this repo.
2. Choose an app hosting service of your choice (e.g., Render, Railway, etc.).
3. Add the following environment variables to your deployment settings:
   ```
   TARGET_URL=https://<your-deployment-domain>/format-message
   TICK_URL=https://<your-deployment-domain>/format-message
   WEBSITE=https://<your-deployment-domain>
   ```
4. In the integration settings, add your hosted app using the `integration.json` file from our hosted application with this URL:
   ```
   https://<your-deployment-domain>/integration.json
   ```
5. Add the channel ID of the channel where you want to install the integration.
6. Uncheck all other channels in your organization except the channel whose ID was added in the settings to prevent messages from spamming other channels.

## Example
### 1. Creating a New Task
```
$ ./test_script.sh <CHANNEL_ID> 'TODO: warm eba @hng_mentors /d 2025-02-23 18:00'

{
   "event_name":"🎯 New task",
   "message":"<h1><b>🎯 New Task</b></h1> \n<b>Task ID:</b> #4\n<b>📋Task:</b>  warm eba \n<b>👨🏻‍💻 Assigned to:</b> @hng_mentors\n<b>📅 Due By:</b> Sunday, February 23, 2025, 19:00\n",
   "status":"success",
   "username":"Task Bot"
}
```

### 2. Fetching All Tasks in a Channel
The output for this task is sent to the channel by the application. So you need to check the channel for the message.
```
$ ./test_script.sh <CHANNEL_ID> '/tasks'
```

Response:
```
{
   "event_name":"message-formatted",
   "message":"<b><i>🎯 performed task operation: /tasks</i></b>",
   "status":"success",
   "username":"sender"
}
```

The message sent to the channel will look something like this:

![Channel message example](https://i.ibb.co/jv2XJt6F/Screenshot-from-2025-02-23-18-00-31.png)

## Contributing
We welcome contributions! To get started:

1. **Fork the repository** and create your own branch.
2. **Make your changes** and ensure they follow the project's guidelines.
3. **Commit your changes** with a clear and concise commit message.
4. **Push your changes** to your forked repository.
5. **Open a pull request** with a detailed explanation of the changes you've made.

## Resources
1. **[TELEX](https://telex.im/)**
2. **[TELEX DOCUMENTATION](https://docs.telex.im/docs/intro)**
