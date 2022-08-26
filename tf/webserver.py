import asyncio
import json
import os
import signal
from sqlite3 import connect
import websockets

async def interface(img_url):
    print("[Message received from interface] {}".format(img_url))

    event = {"type": "connection", "sender": "webserver", "message": img_url}

    await connections["localclient"].send(json.dumps(event)) # (3)
    print("[Msg sent to the local client] ", img_url)

    event = await connections["localclient"].recv() # (4)
    event = json.loads(event)
    assert event["type"] == "disconnection"

    if event["sender"] == "localclient": 
        str_pos_light = event["message"]
        print("[Message received from local client] {}".format(str_pos_light))

        connections["localclient"].close()
        print("[Local client disconnected]")

    event = {"type": "disconnection", "sender": "webserver", "message": str_pos_light}

    await connections["interface"].send(json.dumps(event)) # (5)
    print("[Msg sent to the interface] ", str_pos_light)

    connections["interface"].close()
    print("[Interface disconnected]")
    
async def webserver(ws):
    event = await ws.recv() # Communication established with the local client (1) and interface (2)
    event = json.loads(event)
    assert event["type"] == "connection"

    if event["sender"] == "localclient": 
        connections.update({"localclient": ws})
        print("[Local client connected]")

    if event["sender"] == "interface":
        connections.update({"interface": ws})
        print("[Interface connected]")

        await interface(event["message"])

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    connections = {"interface": "", "localclient": ""}
    
    asyncio.run(main())