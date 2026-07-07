from fastapi import FastAPI


app = FastAPI(title="BuildTrack API")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "BuildTrack API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}
