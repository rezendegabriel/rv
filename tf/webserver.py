import asyncio
import json
import os
import signal
from sqlite3 import connect
import websockets

async def localClient(ws, str_pos_light):
    print("[Msg received from local server] {}".format(str_pos_light))

    event_1 = {"type": "end", "message": str_pos_light}

    await ws.send(json.dumps(event_1))

async def interface(ws, img_url):
    print("[Msg received from interface] {}".format(img_url))

    event_1 = {"type": "middle", "message": img_url}

    await ws.send(json.dumps(event_1))

    message = await ws.recv()
    event = json.loads(message)

    if event["type"] == "end":
        await localClient(ws, event["message"]) # Communication established by the local client

async def webserver(ws):
    message = await ws.recv()
    event = json.loads(message)

    if event["type"] == "init":
        await interface(ws, event["message"]) # Communication established by the interface

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())