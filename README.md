# De-Codeforces
## Description
De-Codeforces is a discord bot centered around competitive programming.
## Features
* Codeforces commands that can recommend problems using ML algorithm which predicts the weak topics of a user and taking his rating into account.
* $upcoming shows details of upcoming/running contest.
* $rGraph and $status Plots various data gathered from Codeforces, e.g. rating distributions and user problem statistics.
* $set sets information about a particular user's codeforces handle and gives a role based on his rank in the server.
* $board shows leaderboard based on rating or number of problems solved of the user who sets their CF handle and friends added by them.
* Plays music depending on moods example: lofi,happy,regular
### Invite link

## Installation
### Clone the repository
Clone the repo using ``` git clone https://github.com/Harmeet-Singh19/cf_discord_bot ``` or download the .rar file.
### Installing dependencies
Install the dependencies by  typin ``` npm i ``` on your console
### Final touches
You will need to setup a bot on your server before continuing, follow the directions [here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token). Following this, you should have your bot appearing in your server and you should have the Discord bot token. Finally, go to the Bot settings in your App's Developer Portal (in the same page where you copied your Bot Token) and enable the Server Members Intent.
Paste the discort bot token in .env. Then start the bot using ``` npm run dev ```.

## Notes
* In order to find relevant commands use $help which will bring a list of commands/groups of commands which are available. To get more details about a specific command you can type ``` $help,<command-name>```.
* In order for the bot to give roles it should have roles permission.

## Libraries and API used
* Codeforces API
* Chart.js
* googl-it


