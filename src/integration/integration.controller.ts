import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { MODIFIER_JSON } from './modifier-json';
import { ModifierIntegrationRequestPayload } from './dto/modifier-integration.dto';

const integrationService = new IntegrationService()

const messageQueue: Array<ModifierIntegrationRequestPayload> = [];

async function processQueue() {
    while (messageQueue.length > 0) {
        const payload = messageQueue.shift();
        try {
            await integrationService.sendFormattedMessageToChannel(payload.channel_id, payload.message);
        } catch(error) {
            console.error("Message queue processing error: " + error.message)
        }
    }
}


setInterval(() => {
    processQueue()
}, 1000)

@Controller('')
export class IntegrationController {
    @Get("integration.json")
    getModifierJson(
        @Req()
        req
    ) {
        return MODIFIER_JSON;
        }
    


    @Post("/format-message") 
    @HttpCode(200)
    formatMessage(
        @Body()
        reqBody: ModifierIntegrationRequestPayload
    ) {

        messageQueue.push(reqBody);
        return {
            status: "success",
            message: reqBody?.message || "Message Received"

        }
    }
}
