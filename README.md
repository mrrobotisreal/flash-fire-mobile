### Outline handling read messages

How do we know when a message has been read?

- When a user clicks to open a chat with messages waiting

But what about a live conversation? For example, if I have the chat open and I am continuously texting (not leaving and reopening chat)

- When a user clicks to open a chat with messages waiting
- When a user is continuously messaging with an open chat

How do we handle each of these situations?

1. When a user clicks to open a chat with messages waiting

- This is easy, just send a websocket message to the server marking all of the appropriate messages as read

2. When a user is continuously messages with an open chat

- This is a bit more tricky. Maybe we can use a boolean indicating a chat is open?
