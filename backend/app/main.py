from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.core.config import settings
from app.services.vector_db import vector_db
from app.api.routes_rag import router as rag_router
from app.api.routes_stt import router as stt_router
from app.api.routes_benchmark import router as benchmark_router
from app.api.routes_dataset import router as dataset_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize index on startup
    print(f"[Lifespan] Initializing Vector DB with strategy: {settings.default_chunking_strategy}")
    vector_db.build_index(strategy=settings.default_chunking_strategy)
    print(f"[Lifespan] Indexed {len(vector_db.chunks)} chunks successfully.")
    yield
    print("[Lifespan] Shutting down application.")

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Voice-Enabled Sub-200ms RAG System for HH Goa 2026 Task 2",
        lifespan=lifespan
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=settings.allowed_methods,
        allow_headers=settings.allowed_headers,
    )

    app.include_router(rag_router, prefix="/api")
    app.include_router(stt_router, prefix="/api")
    app.include_router(benchmark_router, prefix="/api")
    app.include_router(dataset_router, prefix="/api")

    @app.get("/api/health")
    async def health_check() -> Dict[str, Any]:
        return {
            "status": "healthy",
            "app": settings.app_name,
            "version": settings.app_version,
            "latency_target_ms": settings.latency_target_ms,
            "indexed_chunks": len(vector_db.chunks)
        }

    # High-Performance Single-Origin SPA Serving (Zero CORS Latency)
    import os
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
    if os.path.exists(dist_path):
        assets_dir = os.path.join(dist_path, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            if full_path.startswith("api/"):
                return {"error": "Not Found"}
            file_p = os.path.join(dist_path, full_path)
            if os.path.exists(file_p) and os.path.isfile(file_p):
                return FileResponse(file_p)
            return FileResponse(os.path.join(dist_path, "index.html"))

    return app

app = create_app()
