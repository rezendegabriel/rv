from random import seed
from random import random

import asyncio
import cv2
import numpy as np
import urllib.request as url
import websockets

async def imgProcessing(img_url):
    img_url = url.urlopen(img_url)
    img = np.asarray(bytearray(img_url.read()), dtype = "uint8")
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    cv2.imwrite("img.jpeg", img)

    await asyncio.sleep(10)

    coord_r = -5 + (random()*(5-(-5)))
    coord_g = -5 + (random()*(5-(-5)))
    coord_b = -5 + (random()*(5-(-5)))

    return str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))

async def localClient(ws):
    await ws.send("[Local client connected to the web server]") # Communication established with the web server
    print("[Connected from the web server]")

    img_url = await ws.recv()
    print("[Image URL received from the web server]")

    str_pos_light = await imgProcessing(img_url)

    await ws.send(str_pos_light)
    print("[Light position sent to the web server]")

    ws.close()

async def main():
    uri = "wss://websockets-rv.herokuapp.com/"
    async with websockets.connect(uri) as ws:
        await localClient(ws)
        
if __name__ == "__main__":
    seed(1)
    asyncio.run(main())