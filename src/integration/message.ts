import { TaskModel } from "src/db/task-model";
import { formatDateTime } from "./util";

interface DateTimeField {
    date: string;
    time: Date
}

export class Message {
    private message: string;

    constructor(messsage: string) {
        this.message = messsage;

    }

    getTaskFromMessage(): string {
        let task = this.message.split("TODO:")[1].split("@")[0];
        if (task.includes('/')) {
            task = task.split("/")[0]
        }
        return task
    }

    getAssignedToFromMessage(): string {
        // get the user to whom task was assigned
        if (!this.message.includes("@")) return "Not Assigned";
        
        const assignedTo = this.message.split("@")[1].includes("/d") ?   // cater for if there is date
                            "@"+ this.message.split("@")[1].split("/d")[0].trim() :
                            "@" + this.message.split("@")[1].trim()
        
        return assignedTo;
    }

    getDueDateFromMessage(): string {
        // get the date and time a task is to be completed
        const dueDate = this.message.split("/d")[1]
        return dueDate;
    }

    parseDateTimeField(): DateTimeField {
        const dateField = this.getDueDateFromMessage().trim();
        // get date in format yyyy-mm-dd
        
        const match = dateField.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = match ? match[1] : null;
        
        const timeMatch = dateField.match(/\d{2}:\d{2}$/);
    
        const time = timeMatch && date? new Date(`${date}T${timeMatch[0]}:00Z`) : null
        
        return {date, time}

    }

    static composeTaskCreatedMessage(task: TaskModel): string {
        const header = "<h1><b>🎯 New Task</b></h1> \n"
        const id = `<b>Task ID:</b> ${task.task_ID}\n`;
        const description =  `<b>📋Task:</b> ${task.task_description}\n`;
        const assignedTo = `<b>👨🏻‍💻 Assigned to:</b> ${task.assigned_to}\n`;
        const dueBy = `<b>📅 Due By:</b> ${formatDateTime(task.dateTime)}\n`;

        return header + id + description + assignedTo + dueBy
    }


    static composeTaskDoneMessage(task: TaskModel) {
        const header = "✅️ Task Done \n"
        const id = `Task ID: ${task.task_ID}\n`;
        const description =  `✅Task: ${task.task_description}\n`;
        const assignedTo = `👨🏻‍💻 Assigned to: ${task.assigned_to}\n`;
        const dueBy = `📅 Due By: ${formatDateTime(task.dateTime)}\n`;

        return header + id + description + assignedTo + dueBy + "\n";
    }

    static composeFetchAllTasksMessage(task: TaskModel): string {
        const id = `Task ID: ${task.task_ID}\n`;
        const description =  `◽Task: ${task.task_description}\n`;
        const assignedTo = `👨🏻‍💻 Assigned to: ${task.assigned_to}\n`;
        let dueBy = task.getTimeRemaining() ? 
                        `📅 Due By: ${formatDateTime(task.dateTime)} (${task.getTimeRemaining()}) \n` :
                        `📅 Due By: ${formatDateTime(task.dateTime)} \n`;
        
        return  id + description + assignedTo + dueBy + "\n";
    }

    static composeFetchAllCompletedTaskMessage(tasks: TaskModel[]): string {
        if (tasks.length < 1) {
            return "No completed tasks"
        }
        let message = "📝 Completed Tasks \n\n"
        for (let task of tasks) {
            const id = `Task ID: ${task.task_ID}\n`;
            const description =  `✅Task: ${task.task_description}\n`;
            const assignedTo = `👨🏻‍💻 Assigned to: ${task.assigned_to}\n`;
            const dueBy = `📅 Due By: ${formatDateTime(task.dateTime)}\n`;

            message += id + description + assignedTo + dueBy + "\n"
        }

        return message;
    }

    static composeTaskDueMessage(task: TaskModel): string {
        const header = "Task due!\n"
        const id = `Task ID: ${task.task_ID}\n`;
        const description =  `📛Task: ${task.task_description}\n`;
        const assignedTo = `👨🏻‍💻 Assigned to: ${task.assigned_to}\n`;
        const dueBy = `📅 Due By: ${formatDateTime(task.dateTime)}\n`;

        return header + id + description + assignedTo + dueBy + "\n";
    }

    static composeErrorMessage(message: string): string {
        return `❌ Error: ${message}`
    }
}