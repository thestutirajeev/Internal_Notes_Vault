# Internal_Notes_Vault

A simple note-taking application with user authentication and encrypted notes.

## Getting Started
### Installation

1. **Clone the Repository**
2. **Frontend Setup**
   - Navigate to the `frontend` directory and Install dependencies::
     ```bash
     cd frontend
     npm i
     npm run dev
     ```

3. **Backend Setup**
   - Navigate `backend` from root:
     ```bash
     cd backend
     ```
   - Create a virtual environment:
     ```bash
     python -m venv venv
     venv\Scripts\activate  # On Windows, use this; on macOS/Linux use: source venv/bin/activate
     ```
   - Install required packages:
     ```bash
     pip install django djangorestframework
     pip install django-encrypted-model-fields
     pip install djangorestframework-simplejwt
     pip install django-cors-headers
     ```
   - Run the Django server:
     ```bash
     python manage.py runserver
     ```

## Usage

- **User Side**: Access the app at [http://localhost:5173/](http://localhost:5173/)
  - Test Username: `user2`
  - Password: `Stuti@123`
- **Admin Panel**: Access at [http://localhost:8000/admin](http://localhost:8000/admin)
  - Username: `stutirajeev`
  - Password: `admin`

## Notes
- Ensure the virtual environment is activated before running backend commands.

Happy note-taking!
