import asyncio
import os
import signal
import websockets

CONNECTIONS = []

IMG_URL = ""
LIGHT_POS = ""

async def webserver(ws):
    global CONNECTIONS
    global IMG_URL, LIGHT_POS

    CONNECTIONS.append(ws)

    if len(CONNECTIONS) == 1:
        print("[Interface connected]")
        IMG_URL = await CONNECTIONS[0].recv() # Received image URL from the interface
        print("[Msg received from the iterface] ", IMG_URL)

    if len(CONNECTIONS) == 2:
        print("[Render connected]")
        await CONNECTIONS[1].send(IMG_URL) # Sent image URL to the render

        LIGHT_POS = await CONNECTIONS[1].recv() # Received light position from the render
        print("[Msg received from the render] ", LIGHT_POS)

    if len(CONNECTIONS) == 3:
        print("[Interface reconnected]")
        await CONNECTIONS[2].send(LIGHT_POS) # Sent light position to the interface

        CONNECTIONS.clear()

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())