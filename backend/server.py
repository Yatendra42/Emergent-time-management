from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Time Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
courses_collection = db["courses"]
tasks_collection = db["tasks"]
time_entries_collection = db["time_entries"]
settings_collection = db["settings"]

# Pydantic Models
class ChapterModel(BaseModel):
    title: str
    completed: bool = False

class CourseCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    chapters: List[ChapterModel] = []
    color: Optional[str] = "#6C5CE7"

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    chapters: Optional[List[ChapterModel]] = None
    color: Optional[str] = None

class CourseResponse(BaseModel):
    id: str
    name: str
    description: str
    chapters: List[dict]
    color: str
    progress: float
    created_at: str

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: str
    due_time: Optional[str] = "09:00"
    status: Optional[str] = "upcoming"  # upcoming, in_progress, completed
    priority: Optional[str] = "medium"  # low, medium, high
    color: Optional[str] = "#6C5CE7"
    course_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    color: Optional[str] = None
    course_id: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str
    due_date: str
    due_time: str
    status: str
    priority: str
    color: str
    course_id: Optional[str]
    created_at: str

class TimeEntryCreate(BaseModel):
    task_id: Optional[str] = None
    course_id: Optional[str] = None
    duration_minutes: int
    date: str
    notes: Optional[str] = ""

class SettingsUpdate(BaseModel):
    dark_mode: Optional[bool] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None

# Helper functions
def serialize_course(course: dict) -> dict:
    chapters = course.get("chapters", [])
    completed = sum(1 for ch in chapters if ch.get("completed", False))
    total = len(chapters)
    progress = (completed / total * 100) if total > 0 else 0
    return {
        "id": str(course["_id"]),
        "name": course.get("name", ""),
        "description": course.get("description", ""),
        "chapters": chapters,
        "color": course.get("color", "#6C5CE7"),
        "progress": round(progress, 1),
        "created_at": course.get("created_at", "")
    }

def serialize_task(task: dict) -> dict:
    return {
        "id": str(task["_id"]),
        "title": task.get("title", ""),
        "description": task.get("description", ""),
        "due_date": task.get("due_date", ""),
        "due_time": task.get("due_time", "09:00"),
        "status": task.get("status", "upcoming"),
        "priority": task.get("priority", "medium"),
        "color": task.get("color", "#6C5CE7"),
        "course_id": task.get("course_id"),
        "created_at": task.get("created_at", "")
    }

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# COURSES ENDPOINTS
@app.get("/api/courses")
async def get_courses():
    courses = list(courses_collection.find())
    return [serialize_course(c) for c in courses]

@app.post("/api/courses")
async def create_course(course: CourseCreate):
    course_dict = course.model_dump()
    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    result = courses_collection.insert_one(course_dict)
    created = courses_collection.find_one({"_id": result.inserted_id})
    return serialize_course(created)

@app.get("/api/courses/{course_id}")
async def get_course(course_id: str):
    try:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return serialize_course(course)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/courses/{course_id}")
async def update_course(course_id: str, course: CourseUpdate):
    try:
        update_data = {k: v for k, v in course.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        updated = courses_collection.find_one({"_id": ObjectId(course_id)})
        return serialize_course(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/courses/{course_id}")
async def delete_course(course_id: str):
    try:
        result = courses_collection.delete_one({"_id": ObjectId(course_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"message": "Course deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/courses/{course_id}/chapters/{chapter_index}/toggle")
async def toggle_chapter(course_id: str, chapter_index: int):
    try:
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        chapters = course.get("chapters", [])
        if chapter_index < 0 or chapter_index >= len(chapters):
            raise HTTPException(status_code=400, detail="Invalid chapter index")
        chapters[chapter_index]["completed"] = not chapters[chapter_index].get("completed", False)
        courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": {"chapters": chapters}}
        )
        updated = courses_collection.find_one({"_id": ObjectId(course_id)})
        return serialize_course(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# TASKS ENDPOINTS
@app.get("/api/tasks")
async def get_tasks(status: Optional[str] = None, date: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if date:
        query["due_date"] = date
    tasks = list(tasks_collection.find(query).sort("due_date", 1))
    return [serialize_task(t) for t in tasks]

@app.post("/api/tasks")
async def create_task(task: TaskCreate):
    task_dict = task.model_dump()
    task_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    result = tasks_collection.insert_one(task_dict)
    created = tasks_collection.find_one({"_id": result.inserted_id})
    return serialize_task(created)

@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str):
    try:
        task = tasks_collection.find_one({"_id": ObjectId(task_id)})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return serialize_task(task)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, task: TaskUpdate):
    try:
        update_data = {k: v for k, v in task.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        result = tasks_collection.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        updated = tasks_collection.find_one({"_id": ObjectId(task_id)})
        return serialize_task(updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    try:
        result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# TIME ENTRIES ENDPOINTS
@app.get("/api/time-entries")
async def get_time_entries(start_date: Optional[str] = None, end_date: Optional[str] = None):
    query = {}
    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["date"] = {"$gte": start_date}
    entries = list(time_entries_collection.find(query))
    return [{
        "id": str(e["_id"]),
        "task_id": e.get("task_id"),
        "course_id": e.get("course_id"),
        "duration_minutes": e.get("duration_minutes", 0),
        "date": e.get("date", ""),
        "notes": e.get("notes", "")
    } for e in entries]

@app.post("/api/time-entries")
async def create_time_entry(entry: TimeEntryCreate):
    entry_dict = entry.model_dump()
    entry_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    result = time_entries_collection.insert_one(entry_dict)
    created = time_entries_collection.find_one({"_id": result.inserted_id})
    return {
        "id": str(created["_id"]),
        "task_id": created.get("task_id"),
        "course_id": created.get("course_id"),
        "duration_minutes": created.get("duration_minutes", 0),
        "date": created.get("date", ""),
        "notes": created.get("notes", "")
    }

# STATISTICS ENDPOINT
@app.get("/api/stats")
async def get_stats():
    # Get counts
    total_courses = courses_collection.count_documents({})
    total_tasks = tasks_collection.count_documents({})
    completed_tasks = tasks_collection.count_documents({"status": "completed"})
    
    # Calculate total hours this week
    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())
    week_entries = list(time_entries_collection.find({
        "date": {"$gte": week_start.isoformat()}
    }))
    total_minutes_week = sum(e.get("duration_minutes", 0) for e in week_entries)
    total_hours_week = round(total_minutes_week / 60, 1)
    
    # Calculate progress
    courses = list(courses_collection.find())
    avg_progress = 0
    if courses:
        progresses = []
        for c in courses:
            chapters = c.get("chapters", [])
            if chapters:
                completed = sum(1 for ch in chapters if ch.get("completed", False))
                progresses.append(completed / len(chapters) * 100)
        if progresses:
            avg_progress = round(sum(progresses) / len(progresses), 1)
    
    return {
        "total_courses": total_courses,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": total_tasks - completed_tasks,
        "hours_this_week": total_hours_week,
        "average_progress": avg_progress
    }

# SETTINGS ENDPOINTS
@app.get("/api/settings")
async def get_settings():
    settings = settings_collection.find_one({"type": "user_settings"})
    if not settings:
        # Create default settings
        default_settings = {
            "type": "user_settings",
            "dark_mode": False,
            "user_name": "John Doe",
            "user_email": "john@example.com"
        }
        settings_collection.insert_one(default_settings)
        return {
            "dark_mode": False,
            "user_name": "John Doe",
            "user_email": "john@example.com"
        }
    return {
        "dark_mode": settings.get("dark_mode", False),
        "user_name": settings.get("user_name", "John Doe"),
        "user_email": settings.get("user_email", "john@example.com")
    }

@app.put("/api/settings")
async def update_settings(settings: SettingsUpdate):
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = settings_collection.update_one(
        {"type": "user_settings"},
        {"$set": update_data},
        upsert=True
    )
    updated = settings_collection.find_one({"type": "user_settings"})
    return {
        "dark_mode": updated.get("dark_mode", False),
        "user_name": updated.get("user_name", "John Doe"),
        "user_email": updated.get("user_email", "john@example.com")
    }

# SEED DATA ENDPOINT (for development)
@app.post("/api/seed")
async def seed_data():
    # Clear existing data
    courses_collection.delete_many({})
    tasks_collection.delete_many({})
    time_entries_collection.delete_many({})
    
    # Seed courses
    courses_data = [
        {
            "name": "Web Development",
            "description": "Full-stack web development course",
            "chapters": [
                {"title": "HTML Basics", "completed": True},
                {"title": "CSS Styling", "completed": True},
                {"title": "JavaScript Fundamentals", "completed": True},
                {"title": "React Introduction", "completed": True},
                {"title": "Node.js Backend", "completed": False}
            ],
            "color": "#6C5CE7",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "name": "Mobile App Design",
            "description": "UI/UX design for mobile applications",
            "chapters": [
                {"title": "Design Principles", "completed": True},
                {"title": "Figma Basics", "completed": True},
                {"title": "Prototyping", "completed": False},
                {"title": "User Testing", "completed": False}
            ],
            "color": "#00CEC9",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "name": "UI/UX Course",
            "description": "Complete UI/UX design masterclass",
            "chapters": [
                {"title": "Color Theory", "completed": True},
                {"title": "Typography", "completed": True},
                {"title": "Layout Design", "completed": True},
                {"title": "Interaction Design", "completed": False}
            ],
            "color": "#FF7675",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    courses_collection.insert_many(courses_data)
    
    # Seed tasks
    today = datetime.now(timezone.utc).date()
    from datetime import timedelta
    tasks_data = [
        {
            "title": "Complete React Chapter 5",
            "description": "Finish the React hooks section",
            "due_date": today.isoformat(),
            "due_time": "10:00",
            "status": "in_progress",
            "priority": "high",
            "color": "#6C5CE7",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "Review JS Fundamentals",
            "description": "Go through closures and promises",
            "due_date": today.isoformat(),
            "due_time": "14:00",
            "status": "upcoming",
            "priority": "medium",
            "color": "#00CEC9",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "Figma UI Practice",
            "description": "Design a mobile app screen",
            "due_date": today.isoformat(),
            "due_time": "16:00",
            "status": "upcoming",
            "priority": "medium",
            "color": "#FF7675",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "Submit UI Design Project",
            "description": "Final submission for the course",
            "due_date": (today + timedelta(days=3)).isoformat(),
            "due_time": "18:00",
            "status": "upcoming",
            "priority": "high",
            "color": "#FF7675",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "JavaScript Quiz",
            "description": "Complete the weekly quiz",
            "due_date": (today + timedelta(days=5)).isoformat(),
            "due_time": "12:00",
            "status": "upcoming",
            "priority": "low",
            "color": "#6C5CE7",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "Read Design Articles",
            "description": "Read 3 articles on modern UI trends",
            "due_date": (today - timedelta(days=1)).isoformat(),
            "due_time": "09:00",
            "status": "completed",
            "priority": "low",
            "color": "#00CEC9",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    tasks_collection.insert_many(tasks_data)
    
    # Seed time entries
    time_data = [
        {"duration_minutes": 120, "date": (today - timedelta(days=1)).isoformat(), "notes": "React study", "created_at": datetime.now(timezone.utc).isoformat()},
        {"duration_minutes": 90, "date": (today - timedelta(days=2)).isoformat(), "notes": "Figma practice", "created_at": datetime.now(timezone.utc).isoformat()},
        {"duration_minutes": 60, "date": (today - timedelta(days=3)).isoformat(), "notes": "JS fundamentals", "created_at": datetime.now(timezone.utc).isoformat()},
        {"duration_minutes": 150, "date": today.isoformat(), "notes": "Course work", "created_at": datetime.now(timezone.utc).isoformat()},
    ]
    time_entries_collection.insert_many(time_data)
    
    return {"message": "Data seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
