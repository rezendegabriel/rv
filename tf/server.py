import asyncio
import os
import signal
import websockets

CONNECTIONS = []

IMG_URL = ""
LIGHT_POS = ""

IMG_URL_RECEIVED = False
IMG_URL_SEND = False

LIGHT_POS_SEND = False
LIGHT_POS_RECEIVED = False
    
async def webserver(ws):
    global CONNECTIONS
    global IMG_URL, LIGHT_POS
    global IMG_URL_RECEIVED, IMG_URL_SEND, LIGHT_POS_SEND, LIGHT_POS_RECEIVED
    
    CONNECTIONS.append(ws)

    if not IMG_URL_RECEIVED:
        IMG_URL = await CONNECTIONS[0].recv() # Received image URL from the interface
        print("[Msg received from the iterface] ", IMG_URL)

        IMG_URL_RECEIVED = True

    if len(CONNECTIONS) == 2:
        if IMG_URL_RECEIVED:
            await CONNECTIONS[1].send(IMG_URL) # Sent image URL to the render

            IMG_URL_SEND = True

        if IMG_URL_SEND:
            LIGHT_POS = await CONNECTIONS[1].recv() # Received light position from the render
            print("[Msg received from the render] ", LIGHT_POS)

            LIGHT_POS_RECEIVED = True
            CONNECTIONS.pop()

        if LIGHT_POS_RECEIVED:
            await CONNECTIONS[0].send(LIGHT_POS) # Sent light position to the interface

            LIGHT_POS_SEND = True
            CONNECTIONS.pop()
async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())