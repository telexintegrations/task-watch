import { config } from "dotenv";

config({path: ".env"})


const target_url = process.env.TARGET_URL;
const tick_url = process.env.TICK_URL;
const website = process.env.WEBSITE;

export const MODIFIER_JSON = {
    data: {
        author: "Odebode Oluwatimilehin",
        date: {
            created_at: "2025-02-17",
            updated_at: "2025-02-17"
        },
        descriptions: {
                app_description: "Task Watch is a task management tool for handling tasks creation and assignment, tasks management and reminder, and setting deadlines for tasks in a team on a telex channel.",
                app_logo: "https://i.ibb.co/ksRwWWL6/DALL-E-2025-02-21-17-38-38-A-modern-and-minimalist-logo-for-TASK-WATCH-The-logo-features-a-notepad-w.webp",
                app_name: "Task Watch",
                app_url: "https://task-watch-production.up.railway.app",
                background_color: "#ffffff"
        },
        integration_category: "Project Management",
        integration_type: "modifier",
        is_active: true,
        key_features: [
            "Receive message from telex channels.",
            "Format message based on predefined Logic and template.",
            "Send formatted message back to channel.",
        ],
        permissions: {
            events: [
                "Receive message from telex channels.",
                "Format message based on predefined Logic and template.",
                "Send formatted message back to channel.",
            ]
        },
        settings: [
            {
                default: "TODO",
                label: "taskMessageMarker",
                required: true,
                type: "text"
            },

            {
                default: "",
                label: "channelID",
                required: true,
                type: "text"
            }
        ],
        target_url,
        tick_url,
        website
    },

}