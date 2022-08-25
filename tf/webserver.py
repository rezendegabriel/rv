import asyncio
import json
import os
import signal
from sqlite3 import connect
import websockets

async def localClient(ws, str_pos_light):
    print("[Msg received from local server] {}".format(str_pos_light))

    event_2 = {"type": "webserver", "message": str_pos_light}

    await ws.send(json.dumps(event_2)) # Communication established to the interface (point 2)

async def interface(ws, img_url):
    print("[Msg received from interface] {}".format(img_url))

    event_1 = {"type": "webserver", "message": img_url}

    await ws.send(json.dumps(event_1)) # Communication established with the local client (point 1)

    message = await ws.recv() # Communication established by the local client (point 1)
    event_1 = json.loads(message)

    if event_1["type"] == "localclient":
        await localClient(ws, event_1["message"])

async def webserver(ws):
    message = await ws.recv() # Communication established by the local client (point 1)
    event_1 = json.loads(message)

    if event_1["type"] == "localclient":
        print("[Msg received from local server] {}".format(event_1["message"]))

        message = await ws.recv() # Communication established by the interface (point 2)
        event_2 = json.loads(message)

        if event_2["type"] == "interface":
            await interface(ws, event_2["message"])

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())