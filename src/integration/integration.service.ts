import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ModifierIntegrationRequestPayload, ModifierIntegrationResponsePayload } from './dto/modifier-integration.dto';
import axios from 'axios';
import { Message } from './message';
import { TaskModel } from 'src/db/task-model';
import { db, InMemoryDb } from 'src/db/inMemorydb';
import { sendFormattedMessageToChannel } from './util';
import { TASK_DONE } from './constants/task-operatiors-expression';
import { TaskService } from './tasks.service';
import { channel } from 'diagnostics_channel';



@Injectable()
export class IntegrationService {
    private logger = new Logger(IntegrationService.name)
    private readonly telexReturnUrl = "https://ping.telex.im/v1/return";
    private taskOperators = ['/tasks', '/tasks-done']
    private taskService = new TaskService();
    

    async getMessageRequestPayload(payload: ModifierIntegrationRequestPayload): Promise<ModifierIntegrationResponsePayload> {
        const message = this.trimHTMLTagsfromMessage(payload.message)
        const channel_id = payload.settings.filter(setting => setting.label == "channelID")[0].default;
        
        if (message.startsWith("TODO:")) {
            
             // save to db
             try {
                this.validateTODOMessage(message)
                const savedTask = await this.saveTaskToDB(payload, channel_id);
                const formattedMessage = Message.composeTaskCreatedMessage(savedTask);
                return new ModifierIntegrationResponsePayload(
                    "🎯 New task",
                    formattedMessage,
                    "success",
                    "Task Bot"
                )
             } catch(error) {
                if (error.response) {
                    
                    const errorMessage = Message.composeErrorMessage(error.message)
                    setImmediate(async () => {
                
                        await this.sendBotMessageToChannel(errorMessage, channel_id, "error")
                    })
                    
                    const modifiedMessage = "<b><i>🎯 performed task operation: " + message;
                    return new ModifierIntegrationResponsePayload(
                        "message-formated",
                        modifiedMessage,
                        "success",
                        "Task Bot"
                    )    
                }

                this.logger.error(error.message);
                const modifiedMessage = "<b><i>❌ task bot internal error for operation: " + message + "</i></b>"
                return new ModifierIntegrationResponsePayload(
                    "message-formatted",
                    modifiedMessage,
                    "error",
                    "sender" 
                )
             }
            
        }
        
        // use operators to display message
        if (message.includes("/tasks")) {
            
            // delegate task operation to bot
            setImmediate(async () => {
                
                const formattedMessage = await this.handleTaskOperation(message, channel_id);
                
                await this.sendBotMessageToChannel(formattedMessage.message, channel_id, formattedMessage.status);
            })
            
            // return the original messge back to channel
            const modifiedMessage = "<b><i>🎯 performed task operation: " + message + "</i></b>"
            return new ModifierIntegrationResponsePayload(
                "message-formatted",
                modifiedMessage,
                "success",
                "sender" 
            )
        }
             // else leave it as is
        return new ModifierIntegrationResponsePayload(
            "Original Message",
            message,
            "success",
            "Task Bot"
        )            
    }


    private async sendBotMessageToChannel(formattedMessage: string, channelID: string, status = 'success', title = '🎯 Task') {
        
        const botMessagePayload = new ModifierIntegrationResponsePayload(
            title,
            formattedMessage,
            status,
            "Task Bot"
        );
        await sendFormattedMessageToChannel(this.telexReturnUrl, channelID, botMessagePayload);
    }


    private trimHTMLTagsfromMessage(message: string) {
        return message.replace(/<[^>]*>/g, '').trim();
    }
    
    
    async handleTaskOperation(operator: string, channel_id: string): Promise<{message: string, status: string}> {
        let message = "";
        try {
            
            if (operator == '/tasks-info') {
                // get documentation
                return {message: this.taskService.handleFetchBotInfo(), status: "success"};
            }

            if (operator == '/tasks-man') {
                // get list of commands
                return {message: this.taskService.handleFetchBotManPage(), status: "success"}
            }

            if (operator == '/tasks') {
                // get all tasks
                return {message: await this.taskService.handleFetchAllTasksOperation(channel_id), status: "success"}
            }
            
            if (operator == '/tasks-done') {
                // get all completed tasks in a channel
                return {message: await this.taskService.handleFetchAllCompletedTasks(channel_id), status: "success"}
            }

            if (operator.includes('/tasks-delete')) {
                await this.taskService.handleTaskDelete(operator, channel_id);
                return {message: '🚯 Task deleted', status: "success"}
            }

            if (operator.includes('/tasks-done')) {
                // expecting a message in the format
                // /tasks-done <task_id> to mark a task as completed
                return {message: await this.taskService.handleMarkTaskAsDoneOperation(operator, channel_id), status: 'success'}
            }
 
            
        } catch (error) {
        if (error.response) {
            message = Message.composeErrorMessage(error.message)
            return {message, status: "error"}
            
            
        } else {
            this.logger.error(error.message)
            message = Message.composeErrorMessage("An error occured within app");
            return {message, status: "error"}
        }
        }

    }

    validateTODOMessage(message: string) {
        
        const messageUtil = new Message(message);
        // validate task field
        const task = messageUtil.getTaskFromMessage().trim();
        if (task.length == 0 ||
            task.startsWith('@') ||
            task.startsWith('/d')
        ) {
            throw new BadRequestException('No task provided')
        
        }
         
        // validate field date
        if (!message.includes('/d')) {
            throw new BadRequestException('Date time field not set')
        }

        // validate field date
        
        const datefield = messageUtil.getDueDateFromMessage().trim();
        const dateRegExp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegExp.test(datefield)) {
            throw new BadRequestException('Date time should follow the format YYYY-MM-DD HH:MM')
        }

        // test time field that it doesn't exceed 23:59
        const timeField = datefield.trim().split(' ')[1];
        const timeRegExp = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
        if (!timeRegExp.test(timeField)) {
            throw new BadRequestException('Invalid time provided')
        }

        
    }
    

    async saveTaskToDB(dto: ModifierIntegrationRequestPayload, channel_id: string) {
        // save every incoming task into db
        try {
            
            dto.message = this.trimHTMLTagsfromMessage(dto.message);
            const messageHelper = new Message(dto.message);
            const {date, time} = messageHelper.parseDateTimeField();

            const newTask = new TaskModel();
            newTask.task_ID = "#" + (db.getCount() + 1);
            newTask.due = false;
            newTask.completed = false;
            newTask.assigned_to = messageHelper.getAssignedToFromMessage();
            newTask.due_by = date;
            newTask.dateTime = time;
            newTask.createdAt = new Date();
            newTask.task_description = messageHelper.getTaskFromMessage();
            newTask.channel_id = channel_id;
            
            await db.save(newTask.task_ID, newTask);
            this.scheduleTaskDueReminder(newTask)
            return newTask;
        } catch (error) {
            throw error    
        }
        
    }

    private scheduleTaskDueReminder(task: TaskModel): void {
        const now = new Date();
        const delay = task.dateTime.getTime() - now.getTime();

        const maxDelay = 2_147_483_000;
    
        if (delay > maxDelay) {
            console.log((`Delay is too log, setting for max delay and retrying execution after then`))
            setTimeout(() => this.scheduleTaskDueReminder(task), maxDelay)
        } else {
            setTimeout(async () => {
                console.log("Executing task due reminder")
                const title = "⏰ Task Due 🔴"
                const message = Message.composeTaskDueMessage(task)
                await this.sendBotMessageToChannel(
                    message,
                    task.channel_id,
                    "error",
                    title,
                
                )
            }, delay)
        }
        
    }
}
