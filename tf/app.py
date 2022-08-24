from random import seed
from random import random

import asyncio
import cv2
import numpy as np
import os
import signal
import urllib.request as url
import websockets

async def imgProcessing(message):
    url_msg = url.urlopen(message)
    img = np.asarray(bytearray(url_msg.read()), dtype = "uint8")
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    cv2.imwrite("img.jpeg", img)

    await asyncio.sleep(10)

    coord_r = -5 + (random()*(5-(-5)))
    coord_g = -5 + (random()*(5-(-5)))
    coord_b = -5 + (random()*(5-(-5)))

    str_pos_light = str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))
    print(str_pos_light)

    return str_pos_light

async def server(ws):
    message = await ws.recv()
    print("Msg: {}".format(message))

    str_pos_light = await imgProcessing(message)

    await ws.send(str_pos_light)

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(server, "", PORT):
        await stop
        
if __name__ == "__main__":
    seed(1)
    asyncio.run(main())