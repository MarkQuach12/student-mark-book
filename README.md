# Student Mark Book

A full-stack web app for managing student classes, attendance, homework, exams, and payments, organized by terms and weeks made specific for the NSW HSC Y11 and Y12 students.
  
Table of Contents

1. [About The Project](#about-the-project)
2. [Getting Started](#getting-started)
3. [Usage](#usage)
4. [Roadmap](#roadmap)

## About The Project

Student Mark Book is a comprehensive classroom management tool designed for educators. It provides a centralized place to track everything about your classes and students across multiple terms and weeks.

**Key Features:**

- **Class Management:** Create and organize classes with per-class color customization
- **Student Tracking:** Add students to classes and monitor their progress
- **Attendance:** Record attendance per student, per term and week
- **Homework:** Assign homework and track completion status
- **Exams:** Schedule exams with a calendar view and track results
- **Payments:** Track payment statuses (unpaid, paid, away) per student
- **Resources:** Attach learning resources and topics to classes
- **Role-Based Access:** Admin users see all classes; standard users see only their assigned classes
- **Calendar View:** Weekly calendar showing classes and upcoming exams
- **Chatbot:** Built-in assistant for quick help
- **Password Reset:** Email-based password recovery via Resend

### Built With

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [MUI](https://mui.com/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [PostgreSQL](https://www.postgresql.org/)

## Getting Started
To get a local copy up and running, follow these steps.

### Prerequisites
- **Node.js** and **npm**
  ```sh
  npm install npm@latest -g
  ```
- **Java 21** (JDK)
- **Maven**
- **PostgreSQL** database (the project uses [Neon](https://neon.tech) in production)

### Installation

1. Clone the repo
  ```sh
   git clone https://github.com/MarkQuach12/student-mark-book.git
  ```
2. **Frontend:** Install dependencies and start the dev server
  ```sh
   cd frontend
   npm install
   npm run dev
  ```
   The frontend runs on `http://localhost:5173`

   
3. **Backend:** Configure the database connection in `backend/src/main/resources/application.properties`, then start the server
  ```sh
   cd backend
   mvn spring-boot:run
  ```
   The backend runs on `http://localhost:8080`
   
4. **Database:** Apply the SQL migration scripts in `backend/sql/` to your PostgreSQL database in order

## Usage

1. **Sign up / Log in:** Create an account or log in with existing credentials
2. **Create a class:** Add a new class from the landing page
3. **Add students:** Navigate into a class and add students
4. **Track progress:** Use the term and week selectors to record attendance, homework completion, and payments
5. **Schedule exams:** Switch to the calendar view to add and view upcoming exams
6. **Admin panel:** Admin users can manage all classes and assign users to classes



## Roadmap

### Implemented
- [x] Student attendance tracking
- [x] Homework assignment and completion tracking
- [x] Payment status tracking
- [x] Exam scheduling with calendar view
- [x] Role-based access control (admin / standard user)
- [x] Class color customization
- [x] Chatbot assistant
- [x] Password reset via email
- [x] Resources and topics per class

### Future Features
- [ ] Export data to CSV/PDF
- [ ] Student performance analytics and reports
- [ ] Mobile-responsive improvements

