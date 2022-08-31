import asyncio
import json
import os
import signal
import websockets

CONNECTIONS = 0

IMG_URL = ""
LIGHT_POS = ""

async def webserver(ws):
    global CONNECTIONS
    global IMG_URL, LIGHT_POS

    CONNECTIONS += 1

    data = await ws.recv()
    event_connection = json.load(data)

    if CONNECTIONS == 1: # Case when the image URL will be received by the Interface
        if event_connection["type"] == "connection":
            if event_connection["sender"] == "interface": # Authentication layer
                event_connection = {
                    "type": "connection"
                }

                await ws.send(json.dumps(event_connection))
                print("[Interface connected]")

                data = await ws.recv() # Received image URL by the Interface
                event_recv = json.load(data)

                if event_recv["type"] == "send":
                    IMG_URL = event_recv["message"]
                    print("[Message received by the Interface] {}".format(IMG_URL))

                print("[Interface disconnected]")
            else:
                event_connection = {
                    "type": "disconnection"
                }

                await ws.send(json.dumps(event_connection))
                print("[Connection not allowed]")

    if CONNECTIONS == 2: # Case when the image URL can be sent to the Render
        if event_connection["type"] == "connection":
            if event_connection["sender"] == "render": # Authentication layer
                event_connection = {
                    "type": "connection"
                }

                await ws.send(json.dumps(event_connection))
                print("[Render connected]")

                event_send = {
                    "type": "send",
                    "message": IMG_URL
                }

                await ws.send(json.dumps(event_send)) # Sent image URL to the Render
                print("[Image URL sent to the Render]")

                data = await ws.recv() # Received light position by the Render
                event_recv = json.load(data)

                if event_recv["type"] == "send":
                    LIGHT_POS = event_recv["message"]
                    print("[Message received by the Render] {}".format(LIGHT_POS))

                print("[Render disconnected]")
            else:
                event_connection = {
                    "type": "disconnection"
                }

                await ws.send(json.dumps(event_connection))
                print("[Connection not allowed]")

    if CONNECTIONS == 3: # Case when the light position can be sent to the Render
        if event_connection["type"] == "connection":
            if event_connection["sender"] == "interface": # Authentication layer
                event_connection = {
                    "type": "connection"
                }

                await ws.send(json.dumps(event_connection))
                print("[Interface connected]")

                event_send = {
                    "type": "send",
                    "message": LIGHT_POS
                }

                await ws.send(json.dumps(event_send)) # Sent light position to the Interface
                print("[Light position sent to the Interface]")

                CONNECTIONS = 0
                print("[Interface disconnected]")
            else:
                event_connection = {
                    "type": "disconnection"
                }

                await ws.send(json.dumps(event_connection))
                print("[Connection not allowed]")

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())