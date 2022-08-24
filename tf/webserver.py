import asyncio
import json
import os
import signal
import websockets

async def server(ws):
    event = await ws.recv()
    event = json.loads(event)

    if event["type"] == "init":
        message = event["message"]
        print("[Msg received from client] {}".format(message))

        event_1 = {"type": "middle", "message": message}

        await ws.send(json.dumps(event_1))
    
    if event["type"] == "end":
        message = event["message"]
        print("[Msg received from local server] {}".format(message))

        event_1 = {"type": "end", "message": message}

        await ws.send(json.dumps(event_1))

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(server, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())