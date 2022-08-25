from random import seed
from random import random

import asyncio
import cv2
import json
import numpy as np
import os
import signal
import urllib.request as url
import websockets

async def imgProcessing(img_url):
    print("[Msg received from web server] {}".format(img_url))

    img_url = url.urlopen(img_url)
    img = np.asarray(bytearray(img_url.read()), dtype = "uint8")
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    cv2.imwrite("img.jpeg", img)

    await asyncio.sleep(10)

    coord_r = -5 + (random()*(5-(-5)))
    coord_g = -5 + (random()*(5-(-5)))
    coord_b = -5 + (random()*(5-(-5)))

    str_pos_light = str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))
    print(str_pos_light)

    return str_pos_light

async def client(ws):
    event_1 = {"type": "localclient", "message": "Local server connected"}
    await ws.send(json.dumps(event_1)) # Communication established with the web server (point 1)

    message = await ws.recv() # Communication established by the web server (point 1)
    event_1 = json.loads(message)

    if event_1["type"] == "webserver":
        str_pos_light = await imgProcessing(event_1["message"])

        event_1 = {"type": "localclient", "message": str_pos_light}

        await ws.send(json.dumps(event_1)) # Communication established with the web server (point 1)

    ws.close()

async def main():
    uri = "wss://websockets-rv.herokuapp.com/"
    async with websockets.connect(uri) as ws:
        await client(ws)
        
if __name__ == "__main__":
    seed(1)
    asyncio.run(main())