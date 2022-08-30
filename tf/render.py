from random import seed
from random import random

import asyncio
import cv2
import numpy as np
import urllib.request as url
import websockets

async def render():
    uri = "wss://websockets-rv.herokuapp.com/"
    async with websockets.connect(uri) as ws:
        img_url = await ws.recv() # Received image URL from the server
        print("[Msg received from the server] {}".format(img_url))

        img_url = url.urlopen(img_url)
        img = np.asarray(bytearray(img_url.read()), dtype = "uint8")
        img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        cv2.imwrite("img.jpeg", img)

        await asyncio.sleep(10)

        coord_r = -3 + (random()*(3-(-3)))
        coord_g = -3 + (random()*(3-(-3)))
        coord_b = -3 + (random()*(3-(-3)))

        light_pos = str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))

        await ws.send(light_pos) # Sent light position to the server
if __name__ == "__main__":
    seed(1)
    asyncio.run(render())