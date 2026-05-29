from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.ws_manager import manager

router = APIRouter()


@router.websocket("/live")
async def live_updates(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
