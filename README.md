# Event Marker Backend

## Requirements
Before running the project, make sure you have:
- Python 3.10+
- PostgreSQL

## Installation and Setup

### 1. Clone the Repository
```sh
git clone https://github.com/denyshub/Event_Marker.git
cd Event_Marker/event_marker
```

### 2. Create and Activate a Virtual Environment
```sh
python -m venv .venv  # Create a virtual environment
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate  # Windows
```

### 3. Install Dependencies
```sh
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the project root and add the following variables:
```ini
DATABASE_NAME=your_db
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=your_host
DATABASE_PORT=your_port
```

### 5. Apply Migrations
```sh
python manage.py migrate
```

### 6. Create a Superuser (Optional)
```sh
python manage.py createsuperuser
```

### 7. Run the Server
```sh
python manage.py runserver
```
The server will be available at: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

