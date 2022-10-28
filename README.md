# OkDoke
OkDoke is a work in progress, community focused Discord bot. 

### Requirements

 - Discord.js V14
 - NodeJS
 - MongoDB

### Environment Variables
OkDoke uses local environment variables to store keys and other useful data for the program to run. Example `.env`
```
DISCORD_TOKEN=token
CLIENT_ID=id
OWNER_ID=id
MONGO_URI=uri
```

### Running the bot
**Starting:** `pnpm run start`
**Development mode** `pnpm run dev`

### Features

 - [x] Slash command system
 - [x] Events system
 - [x] Button system
 - [ ] Context system
 - [x] User live stream presence
 - [x] Role live stream presence
 - [x] Auto moderation features
	 - [x] Anti ghost ping
	 - [x] Anti invites
	 - [x] Anti links
	 - [x] Naughty words
	 - [x] Member muting
	 - [x] Logging
 - [ ] Welcome channel feature
	 - [ ] Custom welcome message
	 - [ ] Custom welcome images
	 - [ ] Rules & accept rules
	 - [ ] Role selection
 - [ ] Experience system
 - [ ] Non slash commands


