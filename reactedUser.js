const filter = m => m.author.id === message.author.id; //This is the filter we use for awaitMessages, basically: It checks that the author of the collected message is correct

const msgId = (await message.channel.awaitMessages(filter, {max: 50}))
    .first()
    .content; //Collects the messageID into the const msgId (You should input the correct ID after the prompt
const fetchMsg = await message
    .channel
    .messages
    .fetch(msgId); //Fetches the message equal to the ID from above
let reactions = fetchMsg
    .reactions
    .cache
    .find(emoji => emoji.emoji.name == '⚔'); //Collects the reactions of the message, where reaction = :white_check_mark: (✅)
fetchMsg
    .reactions
    .cache
    .map(
        async (reaction) => { //Maps out every reaction made on the collected message
            let usersThatReacted = []; //Initiates usersThatReacted as an array
            if (reaction.emoji.name !== "⚔") 
                return; //If the reaction checked isn't equal to ✅, return
            let reactedUsers = await reaction
                .users
                .fetch(); //Fetches the users that reacted with the ✅ on the collected message
            reactedUsers.map((user) => { //Maps out every user that reacted with ✅
                usersThatReacted.push(`**${user.username}#${user.discriminator}**`); //Pushes each user into the array with formatting ** (bold text) username#discriminator
            });
            let users = usersThatReacted
                .join('-')
                .trim(); //Joins all items in the array with a hyphen
            let randomuser = Math.floor(Math.random() * usersThatReacted.length); //Selects a random number, based on the length of the above array
            message
                .channel
                .send(`Randomly selected user:\n${users}`);
        }
    );