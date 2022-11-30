const Message = require('./message.model');
const IDGenerator = require('../../lib/idGenerator');

exports.getLastMessageNumber = async function getLastMessageNumber (chatRoomId) {
    const lastMessage = await Message.query()
        .select('number')
        .where('chatRoom_id', chatRoomId)
        .orderBy('number', 'DESC')
        .limit(1)
        .first();

    return lastMessage ? lastMessage.number : -1;
}

exports.getMessageByNumber = async function getMessageByNumber(chatRoomId, number) {
    const message = await Message.query()
        .where('chatRoom_id', chatRoomId)
        .where('number', number)
        .limit(1)
        .first();

    return message;
}

exports.getOldMessagesForChatRoom = async function (chatRoom, message) {
    console.log(`getOldMessagesForChatRoom CALLED WITH ${chatRoom.id} && ${message.number}`)
    const messages = await Message.query()
        .where('chatRoom_id', chatRoom.id)
        .andWhere('number', '<', message.number)
        .orderBy('number', 'DESC')
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        })
        .limit(100);

    messages.forEach((message) => {
        message.sent_at_readable = convertDateTime(message.sent_at);
    });

    return messages;
}

exports.getLastMessagesForChatRoom = async function (chatRoomId, limit) {
    console.log(`getLastMessagesForChatRoom CALLED WITH ${chatRoomId} && ${limit}`)
    const lastMessagesCount = limit || 100;

    const messages = await Message.query()
        .where('chatRoom_id', chatRoomId)
        .orderBy('number', 'DESC')
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        })
        .limit(lastMessagesCount);

    // remove user detailed info return only username
    messages.forEach((message) => {
        message.sent_at_readable = convertDateTime(message.sent_at);
    });

    return messages.reverse();
}

exports.getLastMessageForChatRoom = async function (chatRoom) {
    console.log(`getLastMessageForChatRoom CALLED WITH ${chatRoom.id}`)

    const message = await Message.query()
        .select('content', 'sent_at')
        .where('chatRoom_id', chatRoom.id)
        .orderBy('number', 'DESC')
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        })
        .limit(1)
        .first();

    if (!message) return generateDefaultMessage(chatRoom);

    message.sent_at_readable = convertDateTime(message.sent_at);

    return message;
}

exports.sendMessage = async function (chatRoomId, userId, content) {
    const lastMessageNumber = await this.getLastMessageNumber(chatRoomId);

    const message = await Message.query()
        .insert({
            id: IDGenerator.generateUUID(),
            chatRoom_id: chatRoomId,
            user_id: userId,
            number: lastMessageNumber + 1,
            content: content,
            sent_at: new Date()
        })
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        });

    message.sent_at_readable = convertDateTime(message.sent_at);
    return message;
}

exports.send1000Messages = async function(chatRoom, user) {
    const newMessages = generate1000Messages(chatRoom, user);
    const messages = await Message.query()
        .insert(newMessages)
        .withGraphFetched('[user(onlyUsername)]')
        .modifiers({
            onlyUsername(builder) {
                builder.select('username');
            },
        });

    messages.forEach((message) => {
        message.sent_at_readable = convertDateTime(message.sent_at);
    });
    return messages;
}

function generate1000Messages(chatRoom, user) {
    const messages = [];
    for (let i = 1; i <= 1000; i++) {
        const newMessage = {
            id: IDGenerator.generateUUID(),
            chatRoom_id: chatRoom.id,
            user_id: user.id,
            number: i-1,
            content: i,
            sent_at: new Date()
        }
        messages.push(newMessage);
    }
    return messages;
}

function generateDefaultMessage(chatRoom) {
    const contents = ['Let send a message!', 'Men always write first'];
    const sent_at_readable = ['now', 'from future', 'last time you opened me']

    const randomContent = Math.floor(Math.random() * contents.length);
    const randomTime = Math.floor(Math.random() * sent_at_readable.length);

    return {
        content: contents[randomContent],
        sent_at: chatRoom.created_at,
        sent_at_readable: convertDateTime(chatRoom.created_at),
        user: {
            username: 'Lithium Bot',
        },
    };
}

function convertDateTime (date) {
    let hours = date.getHours();
    if (hours.toString().length < 2) hours = `0${hours}`;

    let minutes = date.getMinutes();
    if (minutes.toString().length < 2) minutes = `0${minutes}`;

    const day = date.getDate();

    const month = date.getMonth();

    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
}