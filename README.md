# VM Management Platform

This project is a web-based virtual machine (VM) management platform with role-based access control, automation features, and payment integration. It's built using React.js for the frontend, Node.js for the backend, and MongoDB as the database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [User Authentication](#user-authentication)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Project Structure](#project-structure)
10. [Contributing](#contributing)
11. [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.x or later)
- npm (v6.x or later)
- MongoDB (v4.x or later)
- Docker (for containerization and Kubernetes deployment)
- Kubernetes CLI (kubectl)
- Git

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/cyprianndemo/vmmanager.git
   cd vm-management-platform
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../systemapplication
   npm install
   ```

## Configuration

1. Backend configuration:
   - Create a `.env` file in the `backend` directory with the following content:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/vm_management
     JWT_SECRET=your_jwt_secret_here
     SSO_CLIENT_ID=your_sso_client_id
     SSO_CLIENT_SECRET=your_sso_client_secret
     ```

2. Frontend configuration:
   - Create a `.env` file in the `frontend` directory with the following content:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     REACT_APP_SSO_CLIENT_ID=your_sso_client_id
     ```

## Running the Application

1. Start the MongoDB server:
   ```
   mongod
   ```

2. Start the backend server:
   ```
   cd backend
   npm run start
   ```

3. Start the frontend development server:
   ```
   cd systemapplication
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` to access the application.

## User Authentication

There are three ways to access the application:

1. Admin Login:
   - Use the email: `admin123@admin.com`
   - Use the password: `_admin@123`
   - Note: It is strongly recommended to change this password after your first login for security reasons.

2. New User Registration:
   - Navigate to the registration page
   - Fill in the required information to create a new account
   - Use your registered email and password to log in

3. GitHub Authentication:
   - Click on the "Login with GitHub" button
   - Authorize the application to access your GitHub account
   - You will be logged in automatically

## Testing

1. Run backend tests:
   ```
   cd backend
   npm test
   ```

2. Run frontend tests:
   ```
   cd systemapplication
   npm test
   ```

## Deployment

To deploy the application to a Kubernetes cluster:

1. Build and push Docker images:
   ```
   docker build -t vmmanager ./backend
   docker build -t vmmanager ./systemapplication
   docker push your-registry/vmmanager-backend
   docker push your-registry/vmmanager-systemapplication
   ```

2. Apply Kubernetes manifests:
   ```
   kubectl apply -f kubernetes/
   ```

3. Configure SSL:
   - Install and configure cert-manager in your Kubernetes cluster
   - Apply the necessary Certificate and Ingress resources

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD. The pipeline is configured in `.github/workflows/ci-cd.yaml` and includes the following steps:

1. Run tests
2. Build Docker images
3. Push images to a container registry
4. Deploy to Kubernetes cluster

To set up the CI/CD pipeline:

1. Configure secrets in your GitHub repository settings:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `KUBE_CONFIG`

2. Push changes to the `main` branch to trigger the pipeline

## Project Structure

```
vm-management-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── tests/
│   └── package.json
├── systemapplication/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   ├── tests/
│   └── package.json
├── kubernetes/
│   ├── node-deployment.yaml
│   ├── node-service.yaml
│   ├── react-deployment.yaml
│   ├── react-service.yaml
│   └── mongo-deployment.yaml
├── .github/
│   └── workflows/
│       └── ci-cd.yaml
└── README.md
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch-name`
3. Make changes and commit: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature-branch-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.