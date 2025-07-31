# Control Flow Architecture (Backend & Frontend)

```plaintext

+------------------------------------+
|                                    |
|          Client (Browser)          |
|                                    |
+------------------------------------+
                |
                |
                v
+------------------------------------+
|                                    |
|          Frontend (Vite)           |
|  React/Redux UI Components,        |
|  User Interactions, Redux Actions  |
|                                    |
+------------------------------------+
                |
                |
                v
+------------------------------------+
|                                    |
|         API Requests (Axios)       |
|                                    |
+------------------------------------+
                |
                |
                v
+------------------------------------+
|                                    |
|  Vercel Serverless Functions/API   |
|  Entry Point at api/index.js       |
|                                    |
|          Connects to:              |
|          - User Routes             |
|          - Blog Routes             |
|          - Comment Routes          |
|          - SuperAdmin Routes       |
|          - AI Routes               |
|                                    |
+------------------------------------+
                |
                |
                v
+------------------------------------+
|                                    |
|        Backend (Express.js)        |
|                                    |
|  Middleware:                       |
|  - Express.json()                  |
|  - CookieParser                    |
|  - CORS                            |
|                                    |
|  Database Connection               |
|  with MongoDB (Mongoose)           |
|                                    |
+------------------------------------+
```

