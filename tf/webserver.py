import asyncio
import os
import signal
import websockets

img_url = ""
light_pos = ""

async def sendLightPos(ws, light_pos):
    interface = await ws.recv() # Communication restablished with the interface
    print("[" + interface + "]")

    await ws.send(light_pos)
    print("[Light position sent to the interface]")
    
async def sendImgURL(ws, img_url):
    local_client = await ws.recv() # Communication established with the local client
    print("[" + local_client + "]")

    await ws.send(img_url)
    print("[Image URL sent to the local client]")

    light_pos = await ws.recv()
    print("[Light position received from the local client]")

    await sendLightPos(ws, light_pos)
    
async def receiveImgURL(ws):
    img_url = await ws.recv() # Communication established with the interface
    print("[Image URL received from the interface]")

    await sendImgURL(ws, img_url)

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(receiveImgURL, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())