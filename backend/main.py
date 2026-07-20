import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, Any

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        # Maps deviceId -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # Maps deviceId -> Metadata (name, platform, etc)
        self.device_metadata: Dict[str, Dict[str, Any]] = {}

    async def connect(self, device_id: str, websocket: WebSocket, metadata: Dict[str, Any]):
        await websocket.accept()
        self.active_connections[device_id] = websocket
        self.device_metadata[device_id] = metadata

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]
        if device_id in self.device_metadata:
            del self.device_metadata[device_id]

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        # Wait for the first message which must be the registration payload
        data = await websocket.receive_text()
        parsed = json.loads(data)
        
        if parsed.get("type") == "register":
            device_id = parsed.get("deviceId")
            if not device_id:
                await websocket.close()
                return

            metadata = {
                "deviceName": parsed.get("deviceName"),
                "platform": parsed.get("platform"),
                "appVersion": parsed.get("appVersion")
            }

            await manager.connect(device_id, websocket, metadata)
            
            try:
                while True:
                    text_data = await websocket.receive_text()
                    msg = json.loads(text_data)
                    msg_type = msg.get("type")
                    
                    if msg_type == "ping":
                        await websocket.send_text(json.dumps({"type": "pong"}))
                        
                    elif msg_type == "get_online_devices":
                        paired_ids = msg.get("deviceIds", [])
                        online_devices = [
                            {"deviceId": d_id, "metadata": manager.device_metadata[d_id]}
                            for d_id in paired_ids if d_id in manager.active_connections
                        ]
                        await websocket.send_text(json.dumps({
                            "type": "online_devices_response",
                            "devices": online_devices
                        }))
                    else:
                        # Generic router for WebRTC signaling (offer, answer, candidate)
                        target_id = msg.get("targetDeviceId")
                        if target_id and target_id in manager.active_connections:
                            # Attach the sender's deviceId so the target knows who it's from
                            msg["senderDeviceId"] = device_id
                            await manager.send_personal_message(json.dumps(msg), target_id)
            except WebSocketDisconnect:
                manager.disconnect(device_id)
        else:
            await websocket.close()
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.close()
        except:
            pass
