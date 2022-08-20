import asyncio
import cv2
import numpy as np
import os
import signal
import urllib.request as url
import websockets

async def server(ws):
    message = await ws.recv()

    print("Msg: {}".format(message))

    url_msg = url.urlopen(message)
    img = np.asarray(bytearray(url_msg.read()), dtype = "uint8")
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    cv2.imwrite("teste.jpeg", img)

    ws.send("Salved img")

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(server, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())