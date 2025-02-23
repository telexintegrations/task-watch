#!/bin/bash
# This script is for testing Telex

channel_id=$1
message=$2


if [[ -z "$channel_id" || -z "$message" ]]; then
  echo "Usage: $0 <channel_id> <message>"
  exit 1
fi

curl -X POST "http://localhost:3000/format-message" \
     -H "Content-Type: application/json" \
     -d "{
       \"channel_id\": \"$channel_id\",
       \"settings\": [
         {\"label\": \"maxMessageLength\", \"type\": \"number\", \"default\": 30, \"required\": true},
         {\"label\": \"channelID\", \"type\": \"text\", \"default\": \"$channel_id\", \"required\": true},
         {\"label\": \"repeatWords\", \"type\": \"multi-select\", \"default\": \"world, happy\", \"required\": true},
         {\"label\": \"noOfRepetitions\", \"type\": \"number\", \"default\": \"2\", \"required\": true}
       ],
       \"message\": \"$message\"
     }"
