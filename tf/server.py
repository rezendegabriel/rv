import asyncio
import cv2
import numpy as np
import os
import urllib.request as url
import websockets

async def server(ws: str, path: int):
    inp = input("Client joined. \nType ")
    await ws.send(inp)

    while True:
        message = await ws.recv()

        print("Msg: {}".format(message))

        url_msg = url.urlopen(message)
        img = np.asarray(bytearray(url_msg.read()), dtype = "uint8")
        img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        cv2.imwrite("teste.jpeg", img)

PORT = int(os.environ.get("PORT", "8080")) 
SERVER = websockets.serve(server, "", PORT)

asyncio.get_event_loop().run_until_complete(SERVER)
asyncio.get_event_loop().run_forever()