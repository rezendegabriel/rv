import asyncio
import json
import os
import signal
from sqlite3 import connect
import websockets

async def localclient(ws, img_url):
    event = {"type": "connection", "sender": "webserver", "message": img_url}

    await ws.send(json.dumps(event)) # (3)
    print("[Msg sent to the local client] ", img_url)

    event = await ws.recv() # (4)
    event = json.loads(event)
    assert event["type"] == "disconnection"

    if event["sender"] == "localclient": 
        str_pos_light = event["message"]
        print("[Message received from local client] {}".format(str_pos_light))

        ws.close()
        print("[Local client disconnected]")

    event = {"type": "disconnection", "sender": "webserver", "message": str_pos_light}

    await ws.send(json.dumps(event)) # (5)
    print("[Msg sent to the interface] ", str_pos_light)

    ws.close()
    print("[Interface disconnected]")
    
async def webserver(ws):
    event = await ws.recv() # Communication established with the interface (1)
    event = json.loads(event)
    assert event["type"] == "connection"

    if event["sender"] == "interface": 
        print("[Interface connected]")

        img_url = event["message"]
        print("[Message received from interface] {}".format(img_url))

    ws.close()
    print("[Interface disconnected]")

    event = await ws.recv() # Communication established with the local client (2)
    event = json.loads(event)
    assert event["type"] == "connection"

    if event["sender"] == "localclient":
        print("[Local client connected]")

        await localclient(ws, img_url)

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())